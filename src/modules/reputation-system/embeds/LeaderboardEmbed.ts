import BaseEmbed from "../../../lib/BaseEmbed"
import Collection from "../../../lib/Collection"
import Member from "../../../models/Member"
import LocaleProvider from "../../../services/LocaleProvider"
import { getLevel, space } from "../../../utils"
import SettingsConfig from "../../settings/models/Configuration"
import ReputationSystemConfig from "../models/Configuration"

export default class LeaderbaordEmbed extends BaseEmbed {
    constructor(settings: SettingsConfig, locale: LocaleProvider, { members, config }: {
        members: Collection<Member>,
        config: ReputationSystemConfig
    }) {
        super(settings)

        this.setTitle(locale.translate("embed_leaderboard_title"))

        let desc = ""

        members.forEach((user, i) => {
            const level = getLevel(config, user.reputation)
            const nextLevelReputation = config.roleThresholds[Math.min(level + 1, config.roleThresholds.length - 1)]

            desc += `**# ${i + 1} - ${user.discordUser.username}**\n`

            desc += `${space(9)} ${locale.translate("embed_leaderboard_reputation")} ${space(1)} \`\`${user.reputation}/${nextLevelReputation}\`\`\n`

            if (level !== -1) {
                desc += `${space(9)} ${locale.translate("embed_leaderboard_rank")} ${space(12)} \`\`${config.roles[level] || ""}\`\`\n`
            }

            desc += "\n"
        })

        this.setDescription(desc)
    }
}
