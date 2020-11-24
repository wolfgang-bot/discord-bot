const BaseEmbed = require("./BaseEmbed.js")
const { makeCodeblock } = require("../utils")

class HelpEmbed extends BaseEmbed {
    constructor(config, commands) {
        super(config)

        const groups = this.parseGroups(commands)

        this.setTitle("Hilfe")
            .setDescription(`Sende \`\`${process.env.DISCORD_BOT_PREFIX}help <command>\`\` um mehr Informationen über einen Command zu erhalten.`)

        Object.entries(groups).forEach(([group, commands]) => {
            const commandNames = commands.map(command => command.name).join("\n")
            this.addField(group, makeCodeblock(commandNames), true)
        })
    }

    parseGroups(commands) {
        const groups = {}

        commands.forEach(command => {
            if (!groups[command.group]) {
                groups[command.group] = []
            }

            groups[command.group].push(command)
        })

        return groups
    }
}

module.exports = HelpEmbed