const BaseEmbed = require("./BaseEmbed.js")
const { makeCodeblock } = require("../utils")

class HelpEmbed extends BaseEmbed {
    constructor(commands) {
        super()

        this.setTitle("Hilfe")
            .setDescription(`Sende \`\`${process.env.DISCORD_BOT_PREFIX}help <command>\`\` um mehr Informationen über einen Command zu erhalten.`)
            .setTimestamp(false)

        this.addField("Verfügbare Commands", makeCodeblock(commands.map(command => command.name).join("\n")))
    }
}

module.exports = HelpEmbed