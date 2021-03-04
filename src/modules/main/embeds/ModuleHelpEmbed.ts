import BaseEmbed from "../../../lib/BaseEmbed"
import LocaleProvider from "../../../services/LocaleProvider"
import Module from "../../../lib/Module"
import SettingsConfig from "../../settings/models/Configuration"

export default class ModuleHelpEmbed extends BaseEmbed {
    constructor(settings: SettingsConfig, locale: LocaleProvider, module: typeof Module) {
        super(settings)

        const moduleLocale = locale.scope(module.key)

        const args = module.args.map(arg => `<${moduleLocale.translate(arg.name)}>`).join(" ")

        this.setTitle(locale.translate("embed_module_help_title", module.key))
            .setDescription(moduleLocale.translate(module.desc))
            .addField(locale.translate("embed_module_help_start"), `\`\`${settings.commandPrefix}modules start ${module.key} ${args}\`\``)
            .addField(locale.translate("embed_module_help_features"), moduleLocale.translateArray(module.features).map(e => "• " + e).join("\n"))
    }
}
