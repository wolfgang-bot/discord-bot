const BaseEmbed = require("../../Embeds/BaseEmbed.js")

const makeAvatarURL = user => `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`

class QuestionEmbed extends BaseEmbed {
    constructor(message) {
        super()

        const lines = message.content.split("\n")
        const title = lines.length > 1 ? lines.shift() : ""
        const content = lines.join("\n")

        this.setTitle(title)
            .setDescription(content)
            .setAuthor(message.author.username, makeAvatarURL(message.author))
            .setTimestamp()
            .setColor(config.colors.primary)
            .addField(`Problem gelöst?`, `Super! Reagiere mit ${config.questionChannels.resolveReaction} auf die Nachricht, die dein Problem gelöst hat.`)
    }
}

module.exports = QuestionEmbed