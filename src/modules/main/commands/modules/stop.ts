import * as Discord from "discord.js"
import Command from "../../../../lib/Command"
import ModuleServiceProvider from "../../../../services/ModuleServiceProvider"
import LocaleServiceProvider from "../../../../services/LocaleServiceProvider"
import Module from "../../../../models/Module"

export default class StopCommand extends Command {
    name = "stop"
    description = "command_modules_stop_desc"
    arguments = "command_modules_stop_args"

    async run(message: Discord.Message, args: string[]) {
        const locale = await LocaleServiceProvider.guild(message.guild)

        if (!args[0]) {
            await message.channel.send(locale.translate("error_missing_argument", "module"))
            return
        }

        const module = await Module.findBy("name", args[0]) as Module

        if (!module) {
            await message.channel.send(locale.translate("error_module_does_not_exist", args[0]))
            return
        }

        const isLoaded = await ModuleServiceProvider.guild(message.guild).isLoaded(module)

        if (!isLoaded) {
            await message.channel.send(locale.translate("error_module_not_running"))
            return
        }

        await ModuleServiceProvider.guild(message.guild).stopModule(module)

        await message.channel.send(locale.translate("success"))
    }
}