const Command = require("../../../lib/Command.js")
const Module = require("../../../models/Module.js")
const ModuleServiceProvider = require("../../../services/ModuleServiceProvider.js")
const LocaleServiceProvider = require("../../../services/LocaleServiceProvider.js")

async function run(message, args) {
    const locale = await LocaleServiceProvider.guild(message.guild)

    if (!args[0]) {
        return await message.channel.send(locale.translate("error_missing_argument", "module"))
    }

    const module = await Module.findBy("name", args[0])

    if (!module) {
        return await message.channel.send(locale.translate("error_module_does_not_exist", args[0]))
    }
    
    const isLoaded = await ModuleServiceProvider.guild(message.guild).isLoaded(module)

    if (!isLoaded) {
        return await message.channel.send(locale.translate("error_module_not_running"))
    }

    await ModuleServiceProvider.guild(message.guild).stopModule(module)

    await message.channel.send(locale.translate("success"))
}

module.exports = new Command(run)
    .setName("stop")
    .setDescription("command_modules_stop_desc")
    .setArguments("command_modules_stop_args")