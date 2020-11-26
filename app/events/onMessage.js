const { parseCommand } = require("../utils")
const runCommand = require("../Commands")

/**
 * Parse the message's content and execute the requested command
 */
async function run(client, message) {
    if (!message.author.bot && message.content.startsWith(process.env.DISCORD_BOT_PREFIX)) {
        if (!message.guild) {
            return await message.channel.send("Commands sind nur auf Servern verfügbar.")
        }

        const [command, args] = parseCommand(message.content)

        runCommand(command, message, args)
    }
}

module.exports = run