const Discord = require("discord.js")

class BaseEmbed extends Discord.MessageEmbed {
    constructor(config) {
        super()

        this.setColor(config.colors.primary)
    }
}

module.exports = BaseEmbed