const BaseEmbed = require("../../../embeds/BaseEmbed.js")
const { getLevel, space } = require("../../../utils")

class LeaderbaordEmbed extends BaseEmbed {
    constructor(config, users) {
        super(config)

        this.setTitle("Leaderboard")

        let desc = ""

        users.forEach((user, i) => {
            const level = getLevel(config, user.reputation)
            const nextLevelReputation = config.reputationSystem.roleThresholds[Math.min(level + 1, config.reputationSystem.roleThresholds.length - 1)]

            desc += `**# ${i + 1} - ${user.discordUser.username}**\n`

            desc += `${space(9)} Reputation ${space(1)} \`\`${user.reputation}/${nextLevelReputation}\`\`\n`

            if (level !== -1) {
                desc += `${space(9)} Rang ${space(12)} \`\`${config.reputationSystem.roles[level] || ""}\`\`\n`
            }

            desc += "\n"
        })

        this.setDescription(desc)
    }
}

module.exports = LeaderbaordEmbed