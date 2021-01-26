import BaseEmbed from "../../../lib/BaseEmbed"

export default class NotificationEmbed extends BaseEmbed {
    constructor(config) {
        super(config)

        this.setTitle("Embed")
    }
}