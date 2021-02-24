import Discord from "discord.js"
import { Module } from "@personal-discord-bot/shared/dist/models"
import { Command } from "@personal-discord-bot/shared/dist/command"
import ModuleInstanceRegistry from "../../../../services/ModuleInstanceRegistry"
import { LocaleProvider } from "@personal-discord-bot/shared/dist"

export default class RestartCommand extends Command {
    name = "restart"
    description = "command_modules_restart_desc"
    arguments = "command_modules_restart_args"

    async run(message: Discord.Message, args: string[]) {
        const locale = await LocaleProvider.guild(message.guild)

        if (!args[0]) {
            throw locale.translate("error_missing_argument", "module")
        }

        const module = await Module.findBy("key", args[0]) as Module

        if (!module) {
            throw locale.translate("error_module_not_found", args[0])
        }

        if (!ModuleInstanceRegistry.guild(message.guild).isLoaded(module)) {
            throw locale.translate("error_module_not_running")
        }

        await ModuleInstanceRegistry.guild(message.guild).restartModule(module)

        await message.channel.send(locale.translate("success"))
    }
}
