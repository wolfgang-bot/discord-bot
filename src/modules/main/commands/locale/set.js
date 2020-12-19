const Command = require("../../../../structures/Command.js")
const LocaleServiceProvider = require("../../../../services/LocaleServiceProvider.js")
const Guild = require("../../../../models/Guild.js")

async function run(message, args) {
    const [newLocale] = args

    const guild = await Guild.findBy("id", message.guild.id)
    const locale = await LocaleServiceProvider.guild(message.guild)

    // Check if all arguments are give
    if (!newLocale) {
        return await message.channel.send(locale.translate("error_missing_argument", "locale_code"))
    }

    // Check if locale exists
    const availableLocales = Object.keys(LocaleServiceProvider.scopes[LocaleServiceProvider.defaultScope])
    if (!availableLocales.includes(newLocale)) {
        return await message.channel.send(locale.translate("error_locale_does_not_exist", newLocale))
    }

    guild.locale = newLocale
    await guild.update()

    await message.channel.send(locale.translate("success"))
}

module.exports = new Command(run)
    .setName("set")
    .setDescription("command_locale_set_desc")
    .setArguments("command_locale_set_args")