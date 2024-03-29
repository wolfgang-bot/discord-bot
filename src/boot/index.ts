import Discord from "discord.js"
import ModuleRegistry from "../services/ModuleRegistry"
import database from "../database"
import loadLocales from "./loadLocales"
import startServer from "../www/server"

function boot(
    client: Discord.Client,
    options: {
        useHttpServer?: boolean
    } = {}
): Promise<void> {
    return new Promise(async resolve => {
        client.once("ready", async () => {
            await ModuleRegistry.boot(client)
            
            if (options.useHttpServer !== false) {
                await startServer(client)
            }
            
            resolve()
        })

        await database.connect()

        await Promise.all([
            loadLocales(),

            client.login(process.env.DISCORD_BOT_TOKEN)
        ])
    })
}

export default boot
