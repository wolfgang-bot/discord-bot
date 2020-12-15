const BaseEmbed = require("../../../lib/BaseEmbed.js")
const { makeCodeblock } = require("../../../utils")

class HelpEmbed extends BaseEmbed {
    constructor(config, locale, groups) {
        super(config)

        this.setTitle(locale.translate("embed_help_title"))
            .setDescription(locale.translate("embed_help_desc", process.env.DISCORD_BOT_PREFIX))

        Object.entries(groups).forEach(([group, commands]) => {
            const commandNames = commands.map(command => command.name).join("\n")
            this.addField(group, makeCodeblock(commandNames), true)
        })
    }
}

module.exports = HelpEmbed