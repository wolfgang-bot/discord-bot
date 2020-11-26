const BaseEmbed = require("./BaseEmbed.js")
const { makeCodeblock } = require("../utils")

class HelpEmbed extends BaseEmbed {
    constructor(config, groups) {
        super(config)

        this.setTitle("Hilfe")
            .setDescription(`Sende \`\`${process.env.DISCORD_BOT_PREFIX}help <command>\`\` um mehr Informationen über einen Command zu erhalten.`)

        Object.entries(groups).forEach(([group, commands]) => {
            const commandNames = commands.map(command => command.name).join("\n")
            this.addField(group, makeCodeblock(commandNames), true)
        })
    }
}

module.exports = HelpEmbed