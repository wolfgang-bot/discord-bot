import * as Discord from "discord.js"
import chalk from "chalk"
import dotenv from "dotenv"
import boot from "./boot"

dotenv.config()

const client = new Discord.Client()

boot(client).then(() => {
    console.log(chalk.green("Discord bot is running"))
})