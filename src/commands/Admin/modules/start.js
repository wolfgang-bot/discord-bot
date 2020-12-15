const Command = require("../../../lib/Command.js")
const ModuleServiceProvider = require("../../../services/ModuleServiceProvider.js")
const LocaleServiceProvider = require("../../../services/LocaleServiceProvider.js")
const Module = require("../../../models/Module.js")

async function run(message, args) {
    const locale = await LocaleServiceProvider.guild(message.guild)

    if (!args[0]) {
        return await message.channel.send(locale.translate("error_missing_argument", "module"))
    }

    const module = await Module.findBy("name", args[0])

    if (!module) {
        return await message.channel.send(locale.translate("error_module_does_not_exist", args[0]))
    }

    // Start the requested module
    let instance
    try {
        instance = await ModuleServiceProvider.guild(message.guild).startModule(message.client, module, args.slice(1))
    } catch (error) {
        if (process.env.NODE_ENV === "development") {
            console.error(error)
        }

        const errorMessage = typeof error === "string" ? error : locale.translate("server_error")

        return message.channel.send(locale.translate("failed", errorMessage))
    }

    await message.channel.send(locale.translate("success"))
}

module.exports = new Command(run)
    .setName("start")
    .setDescription("command_modules_start_desc")
    .setArguments("command_modules_start_args")