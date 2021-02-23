import Discord from "discord.js"
import ModuleRegistry from "../services/ModuleRegistry"
import database from "../database"
import loadLocales from "./loadLocales"
import initModels from "./initModels"
import startServer from "../www/server"

function boot(client: Discord.Client): Promise<void> {
    return new Promise(async resolve => {
        client.once("ready", async () => {
            await ModuleRegistry.boot(client)
            
            await startServer(client)

            resolve()
        })

        await Promise.all([
            database.connect(),
            
            loadLocales(),

            initModels(),

            client.login(process.env.DISCORD_BOT_TOKEN)
        ])
    })
}

export default boot
