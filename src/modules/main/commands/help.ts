import Discord from "discord.js"
import Guild from "@personal-discord-bot/shared/dist/models/Guild"
import { Command } from "@personal-discord-bot/shared/dist/command"
import { CommandGroup  } from "@personal-discord-bot/shared/dist/command"
import CommandRegistry from "../../../services/CommandRegistry"
import { LocaleProvider } from "@personal-discord-bot/shared/dist"
import HelpEmbed from "../embeds/HelpEmbed"
import HelpCommandEmbed from "../embeds/HelpCommandEmbed"

export default class HelpCommand extends Command {
    name = "help"
    group = "General"
    description = "command_help_desc"
    arguments = "command_help_args"

    async run(message: Discord.Message, args: string[]) {
        const config = await Guild.config(message.guild)
        const locale = await LocaleProvider.guild(message.guild)

        let embed: HelpEmbed | HelpCommandEmbed

        if (!args[0]) {
            const groups = CommandRegistry.guild(message.guild).getGroups()
            embed = new HelpEmbed(config, locale, groups)
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

            embed = new HelpCommandEmbed(config, locale, command)
        }

        await message.channel.send(embed)
    }
}
