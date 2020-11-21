const BaseEmbed = require("../../Embeds/BaseEmbed.js")

class RoleEmbed extends BaseEmbed {
    constructor() {
        super()

        this.setTitle("Skill Rollen")
            .setDescription("Klicke auf die Emojis unter dieser Nachricht")
    }
}

module.exports = RoleEmbed