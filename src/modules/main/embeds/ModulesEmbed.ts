import BaseEmbed from "../../../lib/BaseEmbed"
import ModuleRegistry from "../../../services/ModuleRegistry"
import LocaleServiceProvider from "../../../services/LocaleServiceProvider"
import Guild from "../../../models/Guild"
import { makeCodeblock, makeURL } from "../../../utils"

export default class ModulesEmbed extends BaseEmbed {
    constructor(
        config,
        locale: LocaleServiceProvider,
        { guild }: { guild: Guild }
    ) {
        super(config)

        const modules = ModuleRegistry.modules.filter(module => !module.isGlobal)
        const moduleInstances = Object.values(ModuleRegistry.instances[guild.id] || {})

        this.setTitle(locale.translate("embed_modules_list_title"))
            .setDescription(`[${locale.translate("embed_modules_list_dashboard")}](${makeURL("/guild/" + guild.id)})`)
            .addField(
                locale.translate("embed_modules_list_available"),
                makeCodeblock(modules.map(module => module.internalName).join("\n")),
                true
            )
            .addField(
                locale.translate("embed_modules_list_active"),
                makeCodeblock(moduleInstances.map(instance => instance.context.module.internalName).join("\n")),
                true
            )
    }
}