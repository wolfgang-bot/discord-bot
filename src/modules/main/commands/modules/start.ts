import Discord from "discord.js"
import Command from "../../../../lib/Command"
import ModuleRegistry from "../../../../services/ModuleRegistry"
import LocaleProvider from "../../../../services/LocaleProvider"
import Module from "../../../../models/Module"

export default class StartCommand extends Command {
    name = "start"
    description = "command_modules_start_desc"
    arguments = "command_modules_start_args"

    async run(message: Discord.Message, args: string[]) {
        const locale = await LocaleProvider.guild(message.guild)

        if (!args[0]) {
            await message.channel.send(locale.translate("error_missing_argument", "module"))
            return
        }

        const module = await Module.findBy("key", args[0]) as Module

        if (!module) {
            await message.channel.send(locale.translate("error_module_does_not_exist", args[0]))
            return
        }

        // Start the requested module
        try {
            await ModuleRegistry.guild(message.guild).startModule(message.client, module, args.slice(1))
        } catch (error) {
            if (process.env.NODE_ENV === "development") {
                console.error(error)
            }

            const errorMessage = typeof error === "string" ? error : locale.translate("server_error")

            message.channel.send(locale.translate("failed", errorMessage))
            return
        }

        await message.channel.send(locale.translate("success"))
    }
}