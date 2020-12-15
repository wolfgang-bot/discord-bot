const BaseEmbed = require("../../../lib/BaseEmbed.js")
const ModuleServiceProvider = require("../../../services/ModuleServiceProvider.js")
const { makeCodeblock, makeURL } = require("../../../utils")

class ModulesEmbed extends BaseEmbed {
    constructor(config, locale, { guild }) {
        super(config)

        const modules = ModuleServiceProvider.modules.filter(module => !module.isGlobal)
        const moduleInstances = Object.values(ModuleServiceProvider.instances[guild.id])

        this.setTitle(locale.translate("embed_modules_list_title"))
            .setDescription(`[${locale.translate("embed_modules_list_webinterface")}](${makeURL("/config/" + guild.id)})`)
            .addField(locale.translate("embed_modules_list_available"), makeCodeblock(modules.map(module => module.name).join("\n")), true)
            .addField(locale.translate("embed_modules_list_active"), makeCodeblock(moduleInstances.map(({ module }) => module.name).join("\n")), true)
    }
}

module.exports = ModulesEmbed