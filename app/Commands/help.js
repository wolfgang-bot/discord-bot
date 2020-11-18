const Command = require("../lib/Command.js")
const DirectoryServiceProvider = require("../Services/DirectoryServiceProvider.js")
const HelpEmbed = require("../Embeds/HelpEmbed.js")
const HelpCommandEmbed = require("../Embeds/HelpCommandEmbed.js")

async function run(args, message) {
    const commands = await DirectoryServiceProvider.getCommands()

    let embed

    if (!args[0]) {
        embed = new HelpEmbed(commands)
    } else {
        const command = commands.find(command => command.name === args[0])

        if (!command) {
            return await message.channel.send(`Der Command '${args[0]}' existiert nicht`)
        }

        embed = new HelpCommandEmbed(command)
    }

    await message.channel.send(embed)
}

module.exports = new Command(run)
    .setDescription("Zeigt Informationen zu den verfügbaren Commands an.")
    .setUsage("help [command]")
    .setAlias(["?"])