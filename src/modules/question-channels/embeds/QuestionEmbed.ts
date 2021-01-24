import * as Discord from "discord.js"
import BaseEmbed from "../../../lib/BaseEmbed"
import LocaleServiceProvider from "../../../services/LocaleServiceProvider"

export default class QuestionEmbed extends BaseEmbed {
    constructor(config, locale: LocaleServiceProvider, message: Discord.Message) {
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