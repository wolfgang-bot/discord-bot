const Command = require("../../../../structures/Command.js")
const ModuleServiceProvider = require("../../../../services/ModuleServiceProvider.js")
const LocaleServiceProvider = require("../../../../services/LocaleServiceProvider.js")
const ModuleHelpEmbed = require("../../embeds/ModuleHelpEmbed.js")
const Module = require("../../../../models/Module.js")
const Guild = require("../../../../models/Guild.js")

async function run(message, args) {
    const locale = await LocaleServiceProvider.guild(message.guild)

    if (!args[0]) {
        return await message.channel.send(locale.translate("error_missing_argument", "module"))
    }

    const model = await Module.findBy("name", args[0])

    if (!model) {
        return await message.channel.send(locale.translate("error_module_does_not_exist", args[0]))
    }

    const module = ModuleServiceProvider.getModule(model)
    const config = await Guild.config(message.guild)
    await message.channel.send(new ModuleHelpEmbed(config, locale, module))
}

module.exports = new Command(run)
    .setName("help")
    .setDescription("command_modules_help_desc")
    .setArguments("command_modules_help_args")