const Discord = require("discord.js")
const chalk = require("chalk")
require("dotenv").config()

const boot = require("./src/boot")

const client = new Discord.Client()

boot(client).then(() => {
    console.log(chalk.green("Discord bot is running"))
})