const LevelUpEmbed = require("./../embeds/LevelUpEmbed.js")
const Member = require("../../../models/Member.js")
const Guild = require("../../../models/Guild.js")
const { getLevel } = require("../../../utils")

class ReputationManager {
    constructor(client, guild, channel) {
        this.client = client
        this.guild = guild
        this.channel = channel
        this.config = null

        this.roles = []

        this.handleReputationAdd = this.handleReputationAdd.bind(this)
    }

    async handleReputationAdd(member, amount) {
        if (member.user.bot || member.guild.id !== this.guild.id) {
            return
        }
        
        let model = await Member.where(`user_id = '${member.user.id}' AND guild_id = ${member.guild.id}`)

        if (!model) {
            model = new Member({
                user_id: member.user.id,
                guild_id: member.guild.id
            })
            await model.store()
        }

        const prevLevel = getLevel(this.config, model.reputation)

        model.reputation += amount

        await model.update()

        const newLevel = getLevel(this.config, model.reputation)

        if (newLevel > prevLevel) {
            await Promise.all([
                this.changeLevel(member, prevLevel, newLevel),
                this.announceLevelUp(member.user, newLevel)
            ])
        }
    }

    async createRoles() {
        await this.guild.roles.fetch()

        // Loop backwards -> Highest role has the lowest position
        for (let i = this.config.reputationSystem.roles.length - 1; i >= 0; i--) {
            const name = this.config.reputationSystem.roles[i]

            // Skip the role, if there already is a role with the same name
            let role = this.guild.roles.cache.find(role => role.name === name)
            if (role) {
                this.roles[i] = role
                continue
            }

            role = await this.guild.roles.create({
                data: {
                    name,
                    color: this.config.reputationSystem.roleColors[i],
                    hoist: true
                }
            })

            this.roles[i] = role
        }
    }

    async deleteRoles() {
        await Promise.all(this.roles.map(role => role.delete()))
    }

    async changeLevel(member, prevLevel, newLevel) {
        if (prevLevel >= 0) {
            await member.roles.remove(this.roles[prevLevel])
        }
        await member.roles.add(this.roles[newLevel])
    }

    async announceLevelUp(user, newLevel) {
        const message = await this.channel.send(new LevelUpEmbed(this.config, user, newLevel))
        await message.react(this.config.reputationSystem.levelUpReactionEmoji)
    }

    async init() {
        this.config = await Guild.config(this.guild)

        await this.createRoles()
        
        this.client.on("reputationAdd", this.handleReputationAdd)
    }

    async delete() {
        await this.deleteRoles()
        
        this.client.removeListener("reputationAdd", this.handleReputationAdd)
    }
}

module.exports = ReputationManager