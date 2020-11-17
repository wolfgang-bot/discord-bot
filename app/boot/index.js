const attachEvents = require("../events")

function boot(client) {
    return new Promise(async resolve => {
        client.once("ready", resolve)

        await attachEvents(client)

        await client.login(process.env.DISCORD_BOT_TOKEN)
    })
}

module.exports = boot