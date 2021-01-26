import path from "path"
import Discord from "discord.js"
import { makeRunnable, run } from "@m.moelter/task-runner"
import dotenv from "dotenv"
import database from "../database"
import Guild from "../models/Guild"
import Collection from "../lib/Collection"
import defaultConfigRaw from "../config/default"
import { formatDescriptiveObject, transferValues } from "../utils"
dotenv.config({ path: path.join(__dirname, "..", ".env") })

const defaultConfig = formatDescriptiveObject(defaultConfigRaw)

const client = new Discord.Client()

makeRunnable(async () => {
    await run(() => Promise.all([
        database.connect(),
        client.login(process.env.DISCORD_BOT_TOKEN)
    ]), "Setup")


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