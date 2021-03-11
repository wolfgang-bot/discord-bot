import Discord from "discord.js"
import chalk from "chalk"
import path from "path"
import log from "loglevel"
import dotenv from "dotenv"
dotenv.config({ path: path.join(__dirname, "..", ".env") })
import boot from "./boot"

log.setLevel(
    process.env.NODE_ENV === "development" ?
    log.levels.TRACE :
    log.levels.INFO
)

const client = new Discord.Client()

boot(client).then(() => {
    log.info(chalk.green("Discord bot is running"))
})
