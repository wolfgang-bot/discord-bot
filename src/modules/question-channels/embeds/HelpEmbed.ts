import BaseEmbed from "../../../lib/BaseEmbed"
import LocaleProvider from "../../../services/LocaleProvider"
import SettingsConfig from "../../settings/models/Configuration"

export default class HelpEmbed extends BaseEmbed {
    constructor(settings: SettingsConfig, locale: LocaleProvider) {
        super(settings)

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
