const CommandRegistry = require("../services/CommandRegistry.js")

/**
 * Parse the message's content and execute the requested command
 */
async function run(client, message) {
    if (!message.author.bot && message.content.startsWith(process.env.DISCORD_BOT_PREFIX)) {
        try {
            await CommandRegistry.root.run(message)
        } catch(error) {
            if (process.env.NODE_ENV === "development") {
                console.error(error)
            }

            const errorMessage = typeof error === "string" ? error : "Serverfehler"
            await message.channel.send(errorMessage)
        }
    }
}

module.exports = run