const Command = require("../../../../structures/Command.js")
const LocaleServiceProvider = require("../../../../services/LocaleServiceProvider.js")
const Guild = require("../../../../models/Guild.js")
const LocaleEmbed = require("../../embeds/LocaleEmbed.js")

async function run(message) {
    const guild = await Guild.findBy("id", message.guild.id)
    const config = await Guild.config(message.guild)
    const locale = await LocaleServiceProvider.guild(message.guild)

    const availableLocales = Object.keys(LocaleServiceProvider.scopes[LocaleServiceProvider.defaultScope])

    await message.channel.send(new LocaleEmbed(config, locale, guild.locale, availableLocales))
}

module.exports = new Command(run)
    .setName("get")
    .setDescription("command_locale_get_desc")