const attachEvents = require("../events")
const restorePlugins = require("../Plugins")

function boot(client) {
    return new Promise(async resolve => {
        client.once("ready", async () => {
            await restorePlugins(client)
            resolve()
        })

        attachEvents(client)

        await client.login(process.env.DISCORD_BOT_TOKEN)
    })
}

module.exports = boot