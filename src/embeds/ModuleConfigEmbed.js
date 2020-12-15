const BaseEmbed = require("./BaseEmbed.js")
const { capitalCase } = require("change-case")

class ModuleConfigEmbed extends BaseEmbed {
    constructor(config, locale, moduleName, moduleConfig) {
        super(config)
        
        this.setTitle(locale.translate("embed_module_config_title", moduleName))

        Object.entries(moduleConfig).forEach(([key, { description, value }]) => {
            const capitalKey = capitalCase(key)

            value = Array.isArray(value) ? value.join("\n") : value

            this.addField(capitalKey, locale.translate("embed_module_config_field", key, description, value))
        })
    }
}

module.exports = ModuleConfigEmbed