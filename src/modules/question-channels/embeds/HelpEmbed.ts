import BaseEmbed from "@personal-discord-bot/shared/dist/BaseEmbed"
import LocaleProvider from "@personal-discord-bot/shared/dist/LocaleProvider"

export default class HelpEmbed extends BaseEmbed {
    constructor(config, locale: LocaleProvider) {
        super(config)

        this.setTitle(locale.translate("embed_help_title"))
            .addFields([
                {
                    name: locale.translate("embed_help_field_ask_title"),
                    value: locale.translate("embed_help_field_ask_content")
                },
                {
                    name: locale.translate("embed_help_field_format_title"),
                    value: locale.translate("embed_help_field_format_content")
                },
                {
                    name: locale.translate("embed_help_field_how_to_ask_title"),
                    value: locale.translate("embed_help_field_how_to_ask_content")
                },
            ])
    }
}
