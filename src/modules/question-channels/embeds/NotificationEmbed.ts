import Discord from "discord.js"
import { BaseEmbed } from "@personal-discord-bot/shared/dist"
import LocaleProvider from "@personal-discord-bot/shared/dist/LocaleProvider"

export default class NotificationEmbed extends BaseEmbed {
    constructor(config, locale: LocaleProvider, guild: Discord.Guild) {
        super(config)

        this.setTitle(locale.translate("embed_notification_title", guild.name))
            .addFields([
                {
                    name: locale.translate("embed_notification_field_solved_title"),
                    value: locale.translate("embed_notification_field_solved_content", config["question-channels"].resolveReaction)
                },
                {
                    name: locale.translate("embed_notification_field_irrelevant_title"),
                    value: locale.translate("embed_notification_field_irrelevant_content", config["question-channels"].deleteMessage)
                }
            ])
    }
}
