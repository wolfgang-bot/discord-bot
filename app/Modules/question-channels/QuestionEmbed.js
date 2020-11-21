const BaseEmbed = require("../../Embeds/BaseEmbed.js")
const config = require("../../../config")

class QuestionEmbed extends BaseEmbed {
    constructor(message) {
        super()

        const lines = message.content.split("\n")
        const title = lines.length > 1 ? lines.shift() : ""
        const content = lines.join("\n")

        this.setTitle(title)
            .setDescription(content)
            .setAuthor(message.author.username, message.author.displayAvatarURL())
            .setTimestamp()
            .addField(`Problem gelöst?`, `Super! Reagiere mit ${config.questionChannels.resolveReaction} auf die Nachricht die dein Problem gelöst hat und wir entfernen diesen Kanal wieder.`)
            .addField(`Frage nicht mehr relevant?`, `Reagiere mit ${config.questionChannels.deleteReaction} auf diese Nachricht, um diesen Kanal zu entfernen.`)
    }
}

module.exports = QuestionEmbed