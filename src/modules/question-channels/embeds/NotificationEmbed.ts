import Discord from "discord.js"
import BaseEmbed from "../../../lib/BaseEmbed"
import LocaleProvider from "../../../services/LocaleProvider"
import SettingsConfig from "../../settings/models/Configuration"
import QuestionChannelsConfig from "../models/Configuration"

export default class NotificationEmbed extends BaseEmbed {
    constructor(settings: SettingsConfig, locale: LocaleProvider, { guild, config }: {
        guild: Discord.Guild,
        config: QuestionChannelsConfig
    }) {
        super(settings)

        this.setTitle(locale.translate("embed_notification_title", guild.name))
            .addFields([
                {
                    name: locale.translate("embed_notification_field_solved_title"),
                    value: locale.translate("embed_notification_field_solved_content", config.resolveReaction)
                },
                {
                    name: locale.translate("embed_notification_field_irrelevant_title"),
                    value: locale.translate("embed_notification_field_irrelevant_content", config.deleteMessage)
                }
            ])
    }
}
