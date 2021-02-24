import Discord from "discord.js"
import Guild from "@personal-discord-bot/shared/dist/models/Guild"
import { Command } from "@personal-discord-bot/shared/dist/command"
import { LocaleProvider } from "@personal-discord-bot/shared/dist"
import LocaleEmbed from "../../embeds/LocaleEmbed"

export default class LocaleGetCommand extends Command {
    name = "get"
    description = "command_locale_get_desc"

    async run(message: Discord.Message) {
        const guild = await Guild.findBy("id", message.guild.id) as Guild
        const config = await Guild.config(message.guild)
        const locale = await LocaleProvider.guild(message.guild)

        const availableLocales = LocaleProvider.getLocaleKeys()

        await message.channel.send(new LocaleEmbed(config, locale, guild.locale, availableLocales))
    }
}
