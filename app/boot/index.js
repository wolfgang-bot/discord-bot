const attachEvents = require("../events")
const ModuleServiceProvider = require("../services/ModuleServiceProvider.js")
const database = require("../database")
const registerCommands = require("./registerCommands.js")
const loadLocales = require("./loadLocales.js")
const startServer = require("../www/server.js")

function boot(client) {
    return new Promise(async resolve => {
        client.once("ready", async () => {
            await ModuleServiceProvider.loadModules()
            await ModuleServiceProvider.restoreInstances(client)
            
            await startServer(client)

            resolve()
        })

        await Promise.all([
            database.connect(),
            
            attachEvents(client),

            registerCommands(),

            loadLocales(),

            client.login(process.env.DISCORD_BOT_TOKEN)
        ])
    })
}

module.exports = boot