const Command = require("../../lib/Command.js")
const CommandRegistry = require("../../Services/CommandRegistry.js")
const HelpEmbed = require("../../Embeds/HelpEmbed.js")
const HelpCommandEmbed = require("../../Embeds/HelpCommandEmbed.js")
const Guild = require("../../Models/Guild.js")

async function run(message, args) {
    const config = await Guild.config(message.guild)

    let embed

    if (!args[0]) {
        const groups = CommandRegistry.getGroups()
        embed = new HelpEmbed(config, groups)
    } else {
        const command = CommandRegistry.get(args[0])

        if (!command) {
            return await message.channel.send(`Der Command '${args[0]}' existiert nicht`)
        }

        embed = new HelpCommandEmbed(config, command)
    }

    await message.channel.send(embed)
}

module.exports = new Command(run)
    .setDescription("Zeigt Informationen zu den verfügbaren Commands an.")
    .setArguments("[command]")
    .setAlias(["?"])