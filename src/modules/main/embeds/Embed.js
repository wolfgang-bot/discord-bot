const BaseEmbed = require("../../../lib/BaseEmbed.js")

class NotificationEmbed extends BaseEmbed {
    constructor(config) {
        super(config)

        this.setTitle("Embed")
    }
}

module.exports = NotificationEmbed