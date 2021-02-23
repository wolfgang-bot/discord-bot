import path from "path"
import Discord from "discord.js"
import { makeRunnable, run } from "@m.moelter/task-runner"
import dotenv from "dotenv"
import Collection from "@personal-discord-bot/shared/dist/Collection"
import database from "../database"
import Guild from "../models/Guild"
import defaultConfigDescriptive from "../config/default"
import ModuleRegistry from "../services/ModuleRegistry"
import { transferValues } from "../utils"
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") })

let defaultConfig: object

const client = new Discord.Client()

makeRunnable(async () => {
    await run(() => Promise.all([
        database.connect(),
        client.login(process.env.DISCORD_BOT_TOKEN),
        ModuleRegistry.loadModules()
    ]), "Setup")

    defaultConfig = defaultConfigDescriptive.toVanillaObject()

    await run(updateConfigs, "Update configs")

    await run(() => Promise.all([
        database.db.close(),
        client.destroy()
    ]), "Cleanup")
})()

/**
 * Add new and remove obsolete keys from guild's configurations
 */
async function updateConfigs() {
    const guilds = await Guild.getAll() as Collection<Guild>

    await Promise.all(guilds.map(guild => {
        guild.config = transferValues(guild.config, defaultConfig)
        return guild.update()
    }))
}
