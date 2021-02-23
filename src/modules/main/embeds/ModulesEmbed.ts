import BaseEmbed from "@personal-discord-bot/shared/dist/BaseEmbed"
import ModuleRegistry from "../../../services/ModuleRegistry"
import ModuleInstanceRegistry from "../../../services/ModuleInstanceRegistry"
import LocaleProvider from "../../../services/LocaleProvider"
import Guild from "@personal-discord-bot/shared/dist/models/Guild"
import { makeCodeblock, makeURL } from "../../../utils"

export default class ModulesEmbed extends BaseEmbed {
    constructor(
        config,
        locale: LocaleProvider,
        { guild }: { guild: Guild }
    ) {
        super(config)

        const modules = ModuleRegistry.modules.filter(module => !module.isGlobal)
        const moduleInstances = Object.values(ModuleInstanceRegistry.instances[guild.id] || {})

        this.setTitle(locale.translate("embed_modules_list_title"))
            .setDescription(`[${locale.translate("embed_modules_list_dashboard")}](${makeURL("/dashboard/" + guild.id)})`)
            .addField(
                locale.translate("embed_modules_list_available"),
                makeCodeblock(modules.map(module => module.key).join("\n")),
                true
            )
            .addField(
                locale.translate("embed_modules_list_active"),
                makeCodeblock(moduleInstances.map(instance => instance.context.module.key).join("\n")),
                true
            )
    }
}
