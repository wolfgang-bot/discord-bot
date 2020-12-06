const path = require("path")
const Discord = require("discord.js")
const { makeRunnable, run } = require("@m.moelter/task-runner")
require("dotenv").config({ path: path.join(__dirname, "..", ".env") })

const database = require("../app/database")
const Guild = require("../app/models/Guild.js")
const defaultConfigRaw = require("../app/config/default.js")
const { formatDescriptiveObject, transferValues } = require("../app/utils")

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
    const guilds = await Guild.getAll()

    await Promise.all(guilds.map(guild => {
        guild.config = transferValues(guild.config, defaultConfig)
        return guild.update()
    }))
}