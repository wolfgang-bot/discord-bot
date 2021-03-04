import Discord from "discord.js"
import Manager from "../../../lib/Manager"
import Context from "../../../lib/Context"
import LocaleProvider from "../../../services/LocaleProvider"
import LevelUpEmbed from "./../embeds/LevelUpEmbed"
import Member from "../../../models/Member"
import Guild from "../../../models/Guild"
import { getLevel } from "../../../utils"
import Configuration from "../models/Configuration"

export default class ReputationManager extends Manager {
    guildConfig
    config: Configuration
    roles: Discord.Role[] = []

    constructor(context: Context, config: Configuration) {
        super(context)

        this.config = config

        this.handleReputationAdd = this.handleReputationAdd.bind(this)
    }

    async handleReputationAdd(member: Discord.GuildMember, amount: number) {
        if (member.user.bot || member.guild.id !== this.context.guild.id) {
            return
        }
        
        let model = await Member.where(`user_id = '${member.user.id}' AND guild_id = ${member.guild.id}`) as Member

        if (!model) {
            model = new Member({
                user_id: member.user.id,
                guild_id: member.guild.id
            })
            await model.store()
        }

        const prevLevel = getLevel(this.guildConfig, model.reputation)

        model.reputation += amount

        await model.update()

        const newLevel = getLevel(this.guildConfig, model.reputation)

        if (newLevel > prevLevel) {
            await Promise.all([
                this.changeLevel(member, prevLevel, newLevel),
                this.announceLevelUp(member.user, newLevel)
            ])
        }
    }

    async createRoles() {
        await this.context.guild.roles.fetch()

        // Loop backwards -> Highest role has the lowest position
        for (let i = this.config.roles.length - 1; i >= 0; i--) {
            const name = this.config.roles[i]

            // Skip the role, if there already is a role with the same name
            let role = this.context.guild.roles.cache.find(role => role.name === name)
            if (role) {
                this.roles[i] = role
                continue
            }

            role = await this.context.guild.roles.create({
                data: {
                    name,
                    color: this.config.roleColors[i],
                    hoist: true
                }
            })

            this.roles[i] = role
        }
    }

    async deleteRoles() {
        await Promise.all(this.roles.map(role => role.delete()))
    }

    async changeLevel(member: Discord.GuildMember, prevLevel: number, newLevel: number) {
        if (prevLevel >= 0) {
            await member.roles.remove(this.roles[prevLevel])
        }
        await member.roles.add(this.roles[newLevel])
    }

    async announceLevelUp(user: Discord.User, newLevel: number) {
        const locale = (await LocaleProvider.guild(this.context.guild)).scope("reputation-system")

        const message = await this.config.channel.send(new LevelUpEmbed(this.guildConfig, locale, user, newLevel))
        
        await message.react(this.config.levelUpReactionEmoji)
    }

    async init() {
        this.guildConfig = await Guild.config(this.context.guild)

        await this.createRoles()
        
        this.context.client.on("reputationAdd", this.handleReputationAdd)
    }

    async delete() {
        await this.deleteRoles()
        
        this.context.client.removeListener("reputationAdd", this.handleReputationAdd)
    }
}
