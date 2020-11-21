const BaseEmbed = require("../../Embeds/BaseEmbed.js")

class RoleEmbed extends BaseEmbed {
    constructor() {
        super()

        this.setTitle("Skill Rollen")
            .setDescription("Klicke auf ein Emoji unter dieser Nachricht, um die jeweilige Rolle zu erhalten.")
    }
}

module.exports = RoleEmbed