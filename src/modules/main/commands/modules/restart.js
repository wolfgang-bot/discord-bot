const ModuleServiceProvider = require("../../../../services/ModuleServiceProvider.js")
const LocaleServiceProvider = require("../../../../services/LocaleServiceProvider.js")
const Command = require("../../../../structures/Command.js")
const Module = require("../../../../models/Module.js")

async function run(message, args) {
    const locale = await LocaleServiceProvider.guild(message.guild)

    if (!args[0]) {
        throw locale.translate("error_missing_argument", "module")
    }

    const module = await Module.findBy("name", args[0])

    if (!module) {
        throw locale.translate("error_module_not_found", args[0])
    }

    if (!ModuleServiceProvider.guild(message.guild).isLoaded(module)) {
        throw locale.translate("error_module_not_running")
    }

    await ModuleServiceProvider.guild(message.guild).restartModule(module)

    await message.channel.send(locale.translate("success"))
}

module.exports = new Command(run)
    .setName("restart")
    .setDescription("command_modules_restart_desc")
    .setArguments("command_modules_restart_args")