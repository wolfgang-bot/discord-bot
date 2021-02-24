import { BaseEmbed } from "@personal-discord-bot/shared/dist"
import { LocaleProvider } from "@personal-discord-bot/shared/dist"

export default class LocaleEmbed extends BaseEmbed {
    constructor(config, locale: LocaleProvider, code: string, availableCodes: string[]) {
        super(config)

        this.setTitle(locale.translate("embed_locale_title"))
            .setDescription(locale.translate("embed_locale_desc", code))
            .addField(locale.translate("embed_locale_field_available_title"), locale.translate("embed_locale_field_available_content", availableCodes.join("\n")))
    }
}
