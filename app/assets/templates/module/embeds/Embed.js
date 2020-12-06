const BaseEmbed = require("../../../embeds/BaseEmbed.js")

class NotificationEmbed extends BaseEmbed {
    constructor(config) {
        super(config)

        this.setTitle("Embed")
    }
}

module.exports = NotificationEmbed