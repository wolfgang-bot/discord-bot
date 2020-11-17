const Discord = require("discord.js")
const { COLORS } = require("../config/constants.js")

class BaseEmbed extends Discord.MessageEmbed {
    constructor() {
        super()

        this.setColor(COLORS["PRIMARY"])
            .setTimestamp()
    }
}

module.exports = BaseEmbed