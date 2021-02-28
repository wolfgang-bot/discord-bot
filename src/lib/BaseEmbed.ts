import { MessageEmbed } from "discord.js"

class BaseEmbed extends MessageEmbed {
    constructor(config) {
        super()

        this.setColor(config.settings.colors.primary)
    }
}

export default BaseEmbed
