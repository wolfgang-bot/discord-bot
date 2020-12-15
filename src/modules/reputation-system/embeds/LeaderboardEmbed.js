const BaseEmbed = require("../../../embeds/BaseEmbed.js")
const { getLevel, space } = require("../../../utils")

class LeaderbaordEmbed extends BaseEmbed {
    constructor(config, locale, users) {
        super(config)
        
        const moduleConfig = config["reputation-system"]

        this.setTitle(locale.translate("embed_leaderboard_title"))

        let desc = ""

        users.forEach((user, i) => {
            const level = getLevel(config, user.reputation)
            const nextLevelReputation = moduleConfig.roleThresholds[Math.min(level + 1, moduleConfig.roleThresholds.length - 1)]

            desc += `**# ${i + 1} - ${user.discordUser.username}**\n`

            desc += `${space(9)} ${locale.translate("embed_leaderboard_reputation")} ${space(1)} \`\`${user.reputation}/${nextLevelReputation}\`\`\n`

            if (level !== -1) {
                desc += `${space(9)} ${locale.translate("embed_leaderboard_rank")} ${space(12)} \`\`${moduleConfig.roles[level] || ""}\`\`\n`
            }

            desc += "\n"
        })

        this.setDescription(desc)
    }
}

module.exports = LeaderbaordEmbed