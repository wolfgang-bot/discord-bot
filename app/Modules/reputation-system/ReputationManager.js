const User = require("../../Models/User.js")
const LevelUpEmbed = require("./LevelUpEmbed.js")
const config = require("../../../config")
const { getLevel } = require("../../utils")

class ReputationManager {
    constructor(client, guild, channel) {
        this.client = client
        this.guild = guild
        this.channel = channel

        this.roles = []

        this.handleReputationAdd = this.handleReputationAdd.bind(this)
    }

    async handleReputationAdd(member, amount) {
        let model = await User.findBy("id", member.user.id)

        if (!model) {
            model = new User({ id: member.user.id })
            await model.store()
        }

        const prevLevel = this.getLevel(model.reputation)

        model.reputation += amount
        await model.update()

        const newLevel = this.getLevel(model.reputation)

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
        for (let i = config.reputationSystem.roles.length - 1; i >= 0; i--) {
            const name = config.reputationSystem.roles[i]

            // Skip the role, if there already is a role with the same name
            let role = this.guild.roles.cache.find(role => role.name === name)
            if (role) {
                this.roles[i] = role
                continue
            }

            role = await this.guild.roles.create({
                data: {
                    name,
                    color: config.reputationSystem.roleColors[i],
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
        const message = await this.channel.send(new LevelUpEmbed(user, newLevel))
        await message.react(config.reputationSystem.levelUpReactionEmoji)
    }

    async init() {
        this.client.on("reputationAdd", this.handleReputationAdd)

        await this.createRoles()
    }

    async delete() {
        this.client.removeListener("reputationAdd", this.handleReputationAdd)

        await this.deleteRoles()
    }
}

module.exports = ReputationManager