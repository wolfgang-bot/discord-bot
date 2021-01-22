import { MessageEmbed } from "discord.js"

export default class BaseEmbed extends MessageEmbed {
    constructor(config) {
        super()

        this.setColor(config.colors.primary)
    }
}