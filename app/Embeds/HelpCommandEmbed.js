const BaseEmbed = require("./BaseEmbed.js")
const { makeCodeblock } = require("../utils")

class HelpCommandEmbed extends BaseEmbed {
    constructor(command) {
        super()

        this.setTitle("Hilfe: " + command.name)
            .setDescription(command.description)

        this.addField("Benutzung", makeCodeblock(process.env.DISCORD_BOT_PREFIX + command.usage))

        this.addField("Benötigte Rechte", makeCodeblock((command.permissions || []).join("\n")))

        this.addField("Alias", makeCodeblock((command.alias || []).join("\n")))
    }
}

module.exports = HelpCommandEmbed