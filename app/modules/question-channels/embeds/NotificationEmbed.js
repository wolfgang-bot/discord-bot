const BaseEmbed = require("../../../embeds/BaseEmbed.js")

class NotificationEmbed extends BaseEmbed {
    constructor(config, locale, guild) {
        super(config)

        this.setTitle(locale.translate("module_question_channels_embed_notification_title", guild.name))
            .addFields([
                {
                    name: locale.translate("module_question_channels_embed_notification_field_solved_title"),
                    value: locale.translate("module_question_channels_embed_notification_field_solved_content", config["question-channels"].resolveReaction)
                },
                {
                    name: locale.translate("module_question_channels_embed_notification_field_irrelevant_title"),
                    value: locale.translate("module_question_channels_embed_notification_field_irrelevant_content", config["question-channels"].deleteMessage)
                }
            ])
    }
}

module.exports = NotificationEmbed