import Discord from "discord.js"
import Command from "../../../../lib/Command"
import LocaleProvider from "../../../../services/LocaleProvider"
import Guild from "../../../../models/Guild"
import LocaleEmbed from "../../embeds/LocaleEmbed"

export default class LocaleGetCommand extends Command {
    name = "get"
    description = "command_locale_get_desc"

    async run(message: Discord.Message) {
        const guild = await Guild.findBy("id", message.guild.id) as Guild
        const config = await Guild.config(message.guild)
        const locale = await LocaleProvider.guild(message.guild)

        const availableLocales = Object.keys(LocaleProvider.scopes[LocaleProvider.defaultScope])

        await message.channel.send(new LocaleEmbed(config, locale, guild.locale, availableLocales))
    }
}