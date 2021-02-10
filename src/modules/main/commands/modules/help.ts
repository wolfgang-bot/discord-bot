import Discord from "discord.js"
import Command from "../../../../lib/Command"
import ModuleRegistry from "../../../../services/ModuleRegistry"
import LocaleProvider from "../../../../services/LocaleProvider"
import ModuleHelpEmbed from "../../embeds/ModuleHelpEmbed"
import Module from "../../../../models/Module"
import Guild from "../../../../models/Guild"

export default class HelpCommand extends Command {
    name = "help"
    description = "command_modules_help_desc"
    arguments = "command_modules_help_args"

    async run(message: Discord.Message, args: string[]) {
        const locale = await LocaleProvider.guild(message.guild)

        if (!args[0]) {
            await message.channel.send(locale.translate("error_missing_argument", "module"))
            return
        }

        const model = await Module.findBy("name", args[0]) as Module

        if (!model) {
            await message.channel.send(locale.translate("error_module_does_not_exist", args[0]))
            return
        }

        const module = ModuleRegistry.getModule(model)
        const config = await Guild.config(message.guild)
        await message.channel.send(new ModuleHelpEmbed(config, locale, module))
    }
}