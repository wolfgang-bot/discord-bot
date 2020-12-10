const BaseEmbed = require("./BaseEmbed.js")

class ModuleHelpEmbed extends BaseEmbed {
    constructor(config, locale, module) {
        super(config)

        this.setTitle(locale.translate("embed_module_help_title", module.meta.name))
            .setDescription(locale.translate(module.meta.description))
            .addField(locale.translate("embed_module_help_start"), `\`\`${process.env.DISCORD_BOT_PREFIX}modules start ${module.meta.name} ${locale.translate(module.meta.arguments)}\`\``)
            .addField(locale.translate("embed_module_help_features"), locale.translate(module.meta.features).map(e => "• " + e).join("\n"))
    }
}

module.exports = ModuleHelpEmbed