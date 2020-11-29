const attachEvents = require("../events")
const ModuleServiceProvider = require("../services/ModuleServiceProvider.js")
const database = require("../database")
const registerCommands = require("./registerCommands.js")
const startServer = require("../www/server.js")

function boot(client) {
    return new Promise(async resolve => {
        client.once("ready", async () => {
            await ModuleServiceProvider.loadModules()
            await ModuleServiceProvider.restoreInstances(client)
            
            await startServer(client)

            resolve()
        })

        await database.connect()

        await registerCommands()
        
        attachEvents(client)

        await client.login(process.env.DISCORD_BOT_TOKEN)
    })
}

module.exports = boot