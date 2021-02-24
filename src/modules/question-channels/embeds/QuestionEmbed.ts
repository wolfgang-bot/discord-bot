import Discord from "discord.js"
import { BaseEmbed, LocaleProvider } from "@personal-discord-bot/shared/dist"

export default class QuestionEmbed extends BaseEmbed {
    constructor(config, locale: LocaleProvider, message: Discord.Message) {
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
