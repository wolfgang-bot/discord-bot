const BaseEmbed = require("../../../embeds/BaseEmbed.js")

class QuestionEmbed extends BaseEmbed {
    constructor(config, locale, message) {
        super(config)

        const lines = message.content.split("\n")
        const title = lines.length > 1 ? lines.shift() : ""
        const content = lines.join("\n")

        this.setTitle(title)
            .setDescription(content)
            .setAuthor(message.author.username, message.author.displayAvatarURL())
            .setTimestamp()
    }
}

module.exports = QuestionEmbed