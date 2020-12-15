const ModuleServiceProvider = require("../services/ModuleServiceProvider.js")
const database = require("../database")
const loadLocales = require("./loadLocales.js")
const startServer = require("../www/server.js")

function boot(client) {
    return new Promise(async resolve => {
        client.once("ready", async () => {
            await ModuleServiceProvider.loadModules()
            await ModuleServiceProvider.loadModulesToDB()
            await ModuleServiceProvider.restoreInstances(client)
            
            await startServer(client)

            resolve()
        })

        await Promise.all([
            database.connect(),
            
            loadLocales(),

            client.login(process.env.DISCORD_BOT_TOKEN)
        ])
    })
}

module.exports = boot