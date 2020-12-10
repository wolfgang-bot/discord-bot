const BaseEmbed = require("../../../embeds/BaseEmbed.js")

class HelpEmbed extends BaseEmbed {
    constructor(config, locale) {
        super(config)

        this.setTitle(locale.translate("module_question_channels_embed_help_title"))
            .addFields([
                {
                    name: locale.translate("module_question_channels_embed_help_field_ask_title"),
                    value: locale.translate("module_question_channels_embed_help_field_ask_content")
                },
                {
                    name: locale.translate("module_question_channels_embed_help_field_format_title"),
                    value: locale.translate("module_question_channels_embed_help_field_format_content")
                },
                {
                    name: locale.translate("module_question_channels_embed_help_field_how_to_ask_title"),
                    value: locale.translate("module_question_channels_embed_help_field_how_to_ask_content")
                },
            ])
    }
}

module.exports = HelpEmbed