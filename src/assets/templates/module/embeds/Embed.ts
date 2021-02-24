import { BaseEmbed } from "@personal-discord-bot/shared/dist"

export default class NotificationEmbed extends BaseEmbed {
    constructor(config) {
        super(config)

        this.setTitle("Embed")
    }
}
