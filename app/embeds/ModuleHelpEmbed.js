const BaseEmbed = require("./BaseEmbed.js")

class ModuleHelpEmbed extends BaseEmbed {
    constructor(config, locale, module) {
        super(config)

        const moduleLocale = locale.scope(module.meta.name)

        this.setTitle(locale.translate("embed_module_help_title", module.meta.name))
            .setDescription(moduleLocale.translate(module.meta.description))
            .addField(locale.translate("embed_module_help_start"), `\`\`${process.env.DISCORD_BOT_PREFIX}modules start ${module.meta.name} ${moduleLocale.translate(module.meta.arguments)}\`\``)
            .addField(locale.translate("embed_module_help_features"), moduleLocale.translate(module.meta.features).map(e => "• " + e).join("\n"))
    }
}

module.exports = ModuleHelpEmbed