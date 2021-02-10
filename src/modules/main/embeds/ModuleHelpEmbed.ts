import BaseEmbed from "../../../lib/BaseEmbed"
import LocaleProvider from "../../../services/LocaleProvider"
import Module from "../../../lib/Module"

export default class ModuleHelpEmbed extends BaseEmbed {
    constructor(config, locale: LocaleProvider, module: typeof Module) {
        super(config)

        const moduleLocale = locale.scope(module.internalName)

        const args = module.args.map(arg => `<${moduleLocale.translate(arg.name)}>`).join(" ")

        this.setTitle(locale.translate("embed_module_help_title", module.internalName))
            .setDescription(moduleLocale.translate(module.desc))
            .addField(locale.translate("embed_module_help_start"), `\`\`${process.env.DISCORD_BOT_PREFIX}modules start ${module.internalName} ${args}\`\``)
            .addField(locale.translate("embed_module_help_features"), moduleLocale.translateArray(module.features).map(e => "• " + e).join("\n"))
    }
}