import * as Discord from "discord.js"
import Command from "../../../lib/Command"
import CommandRegistry from "../../../services/CommandRegistry"
import LocaleServiceProvider from "../../../services/LocaleServiceProvider"
import HelpEmbed from "../embeds/HelpEmbed"
import HelpCommandEmbed from "../embeds/HelpCommandEmbed"
import Guild from "../../../models/Guild"

export default class HelpCommand extends Command {
    name = "help"
    group = "General"
    description = "command_help_desc"
    arguments = "command_help_args"

    async run(message: Discord.Message, args: string[]) {
        const config = await Guild.config(message.guild)
        const locale = await LocaleServiceProvider.guild(message.guild)

        let embed: HelpEmbed | HelpCommandEmbed

        if (!args[0]) {
            const groups = CommandRegistry.root.getGroups()
            embed = new HelpEmbed(config, locale, groups)
        } else {
            let command: Command = CommandRegistry.root

            // Find requested sub-command in command tree
            for (let name of args) {
                if (!(command instanceof CommandRegistry)) {
                    command = null
                    break
                }

                command = command.get(name)
            }

            if (!command) {
                await message.channel.send(locale.translate("error_command_does_not_exist", args.join(" ")))
                return
            }

            embed = new HelpCommandEmbed(config, locale, command)
        }

        await message.channel.send(embed)
    }
}