const Command = require("../../../lib/Command.js")
const CommandRegistry = require("../../../services/CommandRegistry.js")
const LocaleServiceProvider = require("../../../services/LocaleServiceProvider.js")
const HelpEmbed = require("../embeds/HelpEmbed.js")
const HelpCommandEmbed = require("../embeds/HelpCommandEmbed.js")
const Guild = require("../../../models/Guild.js")

async function run(message, args) {
    const config = await Guild.config(message.guild)
    const locale = await LocaleServiceProvider.guild(message.guild) 

    let embed

    if (!args[0]) {
        const groups = CommandRegistry.root.getGroups()
        embed = new HelpEmbed(config, locale, groups)
    } else {
        let command = CommandRegistry.root
        
        // Find requested sub-command in command tree
        for (let name of args) {
            if (!command.get) {
                command = null
                break
            }

            command = command.get(name)
        }

        if (!command) {
            return await message.channel.send(locale.translate("error_command_does_not_exist", args.join(" ")))
        }

        embed = new HelpCommandEmbed(config, locale, command)
    }

    await message.channel.send(embed)
}

module.exports = new Command(run)
    .setName("help")
    .setGroup("General")
    .setDescription("command_help_desc")
    .setArguments("command_help_args")