const BaseEmbed = require("./BaseEmbed.js")
const { makeCodeblock } = require("../utils")

class HelpCommandEmbed extends BaseEmbed {
    constructor(config, command) {
        super(config)

        this.setTitle("Hilfe: " + command.name)
            .setDescription(command.description)

        const subCommands = command.getCommandNames ? `[${Array.from(command.getCommandNames()).join("|")}]` : null

        this.addFields([
            {
                name: "Benutzung",
                value: makeCodeblock(`${process.env.DISCORD_BOT_PREFIX}${command.getCallableName()} ${command.arguments || subCommands || ""}`)
            },
            {
                name: "Benötigte Rechte",
                value: makeCodeblock(command.getPermissions().join("\n") || " ")
            },
            {
                name: "Alias",
                value: makeCodeblock(command.alias.join("\n") || " ")
            }
        ])
    }
}

module.exports = HelpCommandEmbed