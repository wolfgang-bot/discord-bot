import Discord from "discord.js"
import ModuleServiceProvider from "../services/ModuleServiceProvider"
import database from "../database"
import loadLocales from "./loadLocales"
import startServer from "../www/server"

function boot(client: Discord.Client): Promise<void> {
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

export default boot