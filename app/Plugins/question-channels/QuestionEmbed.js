const Discord = require("discord.js")
const settings = require("./settings.json")

const makeAvatarURL = user => `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`

class QuestionEmbed extends Discord.MessageEmbed {
    constructor(message) {
        super()

        const lines = message.content.split("\n")
        const title = lines.length > 1 ? lines.shift() : ""
        const content = lines.join("\n")

        this.setTitle(title)
            .setDescription(content)
            .setAuthor(message.author.username, makeAvatarURL(message.author))
            .setTimestamp()
            .setColor(settings.embedColor)
            .addField(`Problem gelöst?`, `Super! Reagiere mit ${settings.questionChannelDeleteReaction} auf diese Nachricht, um den Kanal aufzulösen.`)
    }
}

module.exports = QuestionEmbed