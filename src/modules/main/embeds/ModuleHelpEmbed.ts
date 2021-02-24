import { BaseEmbed, LocaleProvider } from "@personal-discord-bot/shared/dist"
import { Module } from "@personal-discord-bot/shared/dist/module"

export default class ModuleHelpEmbed extends BaseEmbed {
    constructor(config, locale: LocaleProvider, module: typeof Module) {
        super(config)

        const moduleLocale = locale.scope(module.key)

        const args = module.args.map(arg => `<${moduleLocale.translate(arg.name)}>`).join(" ")

        this.setTitle(locale.translate("embed_module_help_title", module.key))
            .setDescription(moduleLocale.translate(module.desc))
            .addField(locale.translate("embed_module_help_start"), `\`\`${process.env.DISCORD_BOT_PREFIX}modules start ${module.key} ${args}\`\``)
            .addField(locale.translate("embed_module_help_features"), moduleLocale.translateArray(module.features).map(e => "• " + e).join("\n"))
    }
}
