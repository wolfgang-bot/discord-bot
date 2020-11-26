const BaseEmbed = require("../../../embeds/BaseEmbed.js")

class RoleEmbed extends BaseEmbed {
    constructor(config) {
        super(config)

        this.setTitle("Skill Rollen")
            .setDescription("Klicke auf ein Emoji unter dieser Nachricht, um die jeweilige Rolle zu erhalten.")
    }
}

module.exports = RoleEmbed