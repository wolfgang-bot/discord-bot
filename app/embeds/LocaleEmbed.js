const BaseEmbed = require("./BaseEmbed.js")

class LocaleEmbed extends BaseEmbed {
    constructor(config, locale, code, availableCodes) {
        super(config)

        this.setTitle(locale.translate("embed_locale_title"))
            .setDescription(locale.translate("embed_locale_desc", code))
            .addField(locale.translate("embed_locale_field_available_title"), locale.translate("embed_locale_field_available_content", availableCodes.join("\n")))
    }
}

module.exports = LocaleEmbed