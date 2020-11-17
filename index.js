const Discord = require("discord.js")
const chalk = require("chalk")

const boot = require("./app/boot")

const client = new Discord.Client()

boot(client).then(() => {
    console.log(chalk.green("Discord bot is running"))
})