const Discord = require("discord.js")
const config = require("../../config")

class BaseEmbed extends Discord.MessageEmbed {
    constructor() {
        super()

        this.setColor(config.colors.primary)
    }
}

module.exports = BaseEmbed