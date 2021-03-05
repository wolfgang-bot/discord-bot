import Discord from "discord.js"
import BaseEmbed from "../../../lib/BaseEmbed"
import LocaleProvider from "../../../services/LocaleProvider"
import SettingsConfig from "../../settings/models/Configuration"

export default class QuestionEmbed extends BaseEmbed {
    constructor(settings: SettingsConfig, locale: LocaleProvider, message: Discord.Message) {
        super(settings)

        const lines = message.content.split("\n")
        const title = lines.length > 1 ? lines.shift() : ""
        const content = lines.join("\n")

        this.setTitle(title)
            .setDescription(content)
            .setAuthor(message.author.username, message.author.displayAvatarURL())
            .setTimestamp()
    }
}
