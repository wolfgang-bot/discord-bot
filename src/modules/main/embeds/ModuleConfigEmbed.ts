import { capitalCase } from "change-case"
import { BaseEmbed } from "@personal-discord-bot/shared/dist"
import DescriptiveObject from "@personal-discord-bot/shared/dist/DescriptiveObject"
import LocaleProvider from "@personal-discord-bot/shared/dist/LocaleProvider"

export default class ModuleConfigEmbed extends BaseEmbed {
    constructor(config, locale: LocaleProvider, moduleKey: string, moduleConfig: DescriptiveObject) {
        super(config)
        
        this.setTitle(locale.translate("embed_module_config_title", moduleKey))

        Object.entries(moduleConfig.value).forEach(([key, entry]) => {
            let { description, value } = entry as DescriptiveObject

            const capitalKey = capitalCase(key)

            value = Array.isArray(value) ? value.join("\n") : value

            this.addField(capitalKey, locale.translate("embed_module_config_field", key, description, value))
        })
    }
}
