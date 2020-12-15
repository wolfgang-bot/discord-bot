const Command = require("../../../../lib/Command.js")
const LocaleServiceProvider = require("../../../../services/LocaleServiceProvider.js")
const Guild = require("../../../../models/Guild.js")
const ModulesEmbed = require("../../embeds/ModulesEmbed.js")

async function run(message) {
    const locale = await LocaleServiceProvider.guild(message.guild)

    const config = await Guild.config(message.guild)
    const guild = await Guild.findBy("id", message.guild.id)

    return await message.channel.send(new ModulesEmbed(config, locale, { guild }))
}

module.exports = new Command(run)
    .setName("list")
    .setDescription("command_modules_list_desc")