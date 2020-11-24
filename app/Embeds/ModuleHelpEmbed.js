const BaseEmbed = require("./BaseEmbed.js")

class ModuleHelpEmbed extends BaseEmbed {
    constructor(config, module) {
        super(config)

        this.setTitle(`Modul: ${module.meta.name}`)
            .setDescription(module.meta.description)
            .addField("Starten", `\`\`${process.env.DISCORD_BOT_PREFIX}modules start ${module.meta.name} ${module.meta.arguments}\`\``)
            .addField("Dieses Modul...", module.meta.features.map(e => "• " + e).join("\n"))
    }
}

module.exports = ModuleHelpEmbed