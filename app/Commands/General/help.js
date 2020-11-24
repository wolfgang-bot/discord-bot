const Command = require("../../lib/Command.js")
const DirectoryServiceProvider = require("../../Services/DirectoryServiceProvider.js")
const HelpEmbed = require("../../Embeds/HelpEmbed.js")
const HelpCommandEmbed = require("../../Embeds/HelpCommandEmbed.js")
const Guild = require("../../Models/Guild.js")

async function run(message, args) {
    const commands = await DirectoryServiceProvider.getCommands()
    const config = await Guild.config(message.guild)

    let embed

    if (!args[0]) {
        embed = new HelpEmbed(config, commands)
    } else {
        const command = commands.find(command => command.name === args[0])

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