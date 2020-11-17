const runCommand = require("../Commands")

/**
 * Parse the message's content and execute the requested command
 */
async function run(client, message) {
    if (message.content.startsWith(process.env.DISCORD_BOT_PREFIX)) {
        if (!message.guild) {
            return await message.channel.send("Commands sind nur auf Servern verfügbar.")
        }

        const args = message.content
            .replace(process.env.DISCORD_BOT_PREFIX, "")
            .replace(/\s+/g, " ")
            .split(" ")

        const command = args.shift()

        runCommand(command, args, message)
    }
}

module.exports = run