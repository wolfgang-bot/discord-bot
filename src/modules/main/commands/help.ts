import Discord from "discord.js"
import Command from "../../../lib/Command"
import CommandGroup from "../../../lib/CommandGroup"
import CommandRegistry from "../../../services/CommandRegistry"
import LocaleProvider from "../../../services/LocaleProvider"
import HelpEmbed from "../embeds/HelpEmbed"
import HelpCommandEmbed from "../embeds/HelpCommandEmbed"
import SettingsConfig from "../../../modules/settings/models/Configuration"
import ModuleInstance from "../../../models/ModuleInstance"

export default class HelpCommand extends Command {
    name = "help"
    group = "General"
    description = "command_help_desc"
    arguments = "command_help_args"

    async run(message: Discord.Message, args: string[]) {
        const settings = await ModuleInstance.config(message.guild, "settings") as SettingsConfig
        const locale = await LocaleProvider.guild(message.guild)

        let embed: HelpEmbed | HelpCommandEmbed

        if (!args[0]) {
            const groups = CommandRegistry.guild(message.guild).getGroups()
            embed = new HelpEmbed(settings, locale, groups)
        } else {
            let command: Command = CommandRegistry.guild(message.guild)

            // Find requested sub-command in command tree
            for (let name of args) {
                if (!(command instanceof CommandGroup)) {
                    command = null
                    break
                }

                command = command.get(name)
            }

            if (!command) {
                await message.channel.send(locale.translate("error_command_does_not_exist", args.join(" ")))
                return
            }

            embed = new HelpCommandEmbed(settings, locale, command)
        }

        await message.channel.send(embed)
    }
}
