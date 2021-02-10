import Discord from "discord.js"
import ModuleRegistry from "../services/ModuleRegistry"
import database from "../database"
import loadLocales from "./loadLocales"
import startServer from "../www/server"

function boot(client: Discord.Client): Promise<void> {
    return new Promise(async resolve => {
        client.once("ready", async () => {
            await ModuleRegistry.loadModules()
            await ModuleRegistry.loadModulesToDB()
            await ModuleRegistry.restoreInstances(client)
            
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