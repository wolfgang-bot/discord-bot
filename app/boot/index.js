const attachEvents = require("../events")
const ModuleServiceProvider = require("../Services/ModuleServiceProvider.js")

function boot(client) {
    return new Promise(async resolve => {
        client.once("ready", async () => {
            await ModuleServiceProvider.restoreModules(client)
            resolve()
        })

        attachEvents(client)

        await client.login(process.env.DISCORD_BOT_TOKEN)
    })
}

module.exports = boot