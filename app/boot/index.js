const attachEvents = require("../events")
const ModuleServiceProvider = require("../Services/ModuleServiceProvider.js")
const database = require("../database")

function boot(client) {
    return new Promise(async resolve => {
        client.once("ready", async () => {
            await Promise.all(client.guilds.cache.map(guild => {
                return ModuleServiceProvider.guild(guild).restoreModules(client)
            }))
            resolve()
        })

        await database.connect()

        attachEvents(client)

        await client.login(process.env.DISCORD_BOT_TOKEN)
    })
}

module.exports = boot