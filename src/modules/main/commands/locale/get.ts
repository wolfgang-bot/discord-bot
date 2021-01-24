import * as Discord from "discord.js"
import Command from "../../../../lib/Command"
import LocaleServiceProvider from "../../../../services/LocaleServiceProvider"
import Guild from "../../../../models/Guild"
import LocaleEmbed from "../../embeds/LocaleEmbed"

export default class LocaleGetCommand extends Command {
    name = "get"
    description = "command_locale_get_desc"

    async run(message: Discord.Message) {
        const guild = await Guild.findBy("id", message.guild.id) as Guild
        const config = await Guild.config(message.guild)
        const locale = await LocaleServiceProvider.guild(message.guild)

        const availableLocales = Object.keys(LocaleServiceProvider.scopes[LocaleServiceProvider.defaultScope])

        await message.channel.send(new LocaleEmbed(config, locale, guild.locale, availableLocales))
    }
}