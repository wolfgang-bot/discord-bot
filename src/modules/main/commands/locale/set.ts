import * as Discord from "discord.js"
import Command from "../../../../lib/Command"
import LocaleServiceProvider from "../../../../services/LocaleServiceProvider"
import Guild from "../../../../models/Guild"

export default class SetCommand extends Command {
    name = "set"
    description = "command_locale_set_desc"
    arguments = "command_locale_set_args"
    
    async run(message: Discord.Message, args: string[]) {
        const [newLocale] = args

        const guild = await Guild.findBy("id", message.guild.id) as Guild
        const locale = await LocaleServiceProvider.guild(message.guild)

        if (!newLocale) {
            await message.channel.send(locale.translate("error_missing_argument", "locale_code"))
            return
        }

        const availableLocales = Object.keys(LocaleServiceProvider.scopes[LocaleServiceProvider.defaultScope])
        if (!availableLocales.includes(newLocale)) {
            await message.channel.send(locale.translate("error_locale_does_not_exist", newLocale))
            return
        }

        guild.locale = newLocale
        await guild.update()

        await message.channel.send(locale.translate("success"))
    }
}