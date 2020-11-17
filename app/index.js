const Discord = require("discord.js")

require("dotenv").config()

const boot = require("./boot")

const client = new Discord.Client()

boot(client)