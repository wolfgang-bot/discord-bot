const attachEvents = require("../events")
const PluginServiceProvider = require("../Services/PluginServiceProvider.js")

function boot(client) {
    return new Promise(async resolve => {
        client.once("ready", async () => {
            await PluginServiceProvider.restorePlugins(client)
            resolve()
        })

        attachEvents(client)

        await client.login(process.env.DISCORD_BOT_TOKEN)
    })
}

module.exports = boot