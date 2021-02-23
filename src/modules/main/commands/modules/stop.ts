import Discord from "discord.js"
import Command from "../../../../lib/Command"
import ModuleInstanceRegistry from "../../../../services/ModuleInstanceRegistry"
import LocaleProvider from "@personal-discord-bot/shared/dist/LocaleProvider"
import Module from "@personal-discord-bot/shared/dist/models/Module"

export default class StopCommand extends Command {
    name = "stop"
    description = "command_modules_stop_desc"
    arguments = "command_modules_stop_args"

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

        const isLoaded = await ModuleInstanceRegistry.guild(message.guild).isLoaded(module)

        if (!isLoaded) {
            await message.channel.send(locale.translate("error_module_not_running"))
            return
        }

        await ModuleInstanceRegistry.guild(message.guild).stopModule(module)

        await message.channel.send(locale.translate("success"))
    }
}
