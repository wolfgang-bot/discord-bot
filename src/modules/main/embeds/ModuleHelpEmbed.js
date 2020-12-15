const BaseEmbed = require("../../../lib/BaseEmbed.js")

class ModuleHelpEmbed extends BaseEmbed {
    constructor(config, locale, module) {
        super(config)

        const moduleLocale = locale.scope(module.name)

        const args = module.args.map(arg => `<${moduleLocale.translate(arg.name)}>`).join(" ")

        this.setTitle(locale.translate("embed_module_help_title", module.name))
            .setDescription(moduleLocale.translate(module.desc))
            .addField(locale.translate("embed_module_help_start"), `\`\`${process.env.DISCORD_BOT_PREFIX}modules start ${module.name} ${args}\`\``)
            .addField(locale.translate("embed_module_help_features"), moduleLocale.translate(module.features).map(e => "• " + e).join("\n"))
    }
}

module.exports = ModuleHelpEmbed