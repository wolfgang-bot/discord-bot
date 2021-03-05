import Discord from "discord.js"
import BaseEmbed from "../../../lib/BaseEmbed"
import LocaleProvider from "../../../services/LocaleProvider"
import SettingsConfig from "../../settings/models/Configuration"
import ReputationSystemConfig from "../models/Configuration"

export default class LevelUpEmbed extends BaseEmbed {
    constructor(settings: SettingsConfig, locale: LocaleProvider, { user, level, config }: {
        user: Discord.User,
        level: number,
        config: ReputationSystemConfig
    }) {
        super(settings)

        this.setTitle(locale.translate("embed_levelup_title"))
            .setDescription(locale.translate("embed_levelup_desc", user.toString(), config.roles[level]))
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
    }
}
