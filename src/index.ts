import Discord from "discord.js"
import chalk from "chalk"
import path from "path"
import dotenv from "dotenv"
dotenv.config({ path: path.join(__dirname, "..", ".env") })
import boot from "./boot"

const client = new Discord.Client()

boot(client).then(() => {
    console.log(chalk.green("Discord bot is running"))
})
