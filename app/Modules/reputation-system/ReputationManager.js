const User = require("../../Models/User.js")
const LevelUpEmbed = require("./LevelUpEmbed.js")
const config = require("../../../config")
const { hslToRgb } = require("../../utils")

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
            const level = config.reputationSystem.roles[newLevel]
            console.log(`${member.user.username} ist zu '${level}' aufgestiegen`)
            await Promise.all([
                this.changeLevel(member, prevLevel, newLevel),
                this.announceLevelUp(member.user, newLevel)
            ])
        }

        console.log(`${member.user.username} hat jetzt ${model.reputation} Punkte`)
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

            let color = config.reputationSystem.initialRoleColor

            /**
             * Distribute lightness evenly between 1 and .5
             * For 5 Roles: Role 1 -> lightness .9; Role 2 -> lightness .8
             */
            color[2] = 1 - .5 / config.reputationSystem.roles.length * (i + 1)
            color = hslToRgb(...color)

            role = await this.guild.roles.create({ data: { name, color } })
            this.roles[i] = role
        }
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

    getLevel(reputation) {
        let level = -1

        for (let threshold of config.reputationSystem.roleThresholds) {
            if (reputation >= threshold) {
                level++
            } else {
                return level
            }
        }

        return level
    }

    async init() {
        this.client.on("reputationAdd", this.handleReputationAdd)

        await this.createRoles()
    }

    delete() {
        this.client.removeListener("reputationAdd", this.handleReputationAdd)
    }
}

module.exports = ReputationManager