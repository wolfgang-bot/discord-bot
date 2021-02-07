import { capitalCase } from "change-case"
import BaseEmbed from "../../../lib/BaseEmbed"
import DescriptiveObject from "../../../lib/DescriptiveObject"
import LocaleServiceProvider from "../../../services/LocaleServiceProvider"

export default class ModuleConfigEmbed extends BaseEmbed {
    constructor(config, locale: LocaleServiceProvider, moduleName: string, moduleConfig: DescriptiveObject) {
        super(config)
        
        this.setTitle(locale.translate("embed_module_config_title", moduleName))

        Object.entries(moduleConfig.value).forEach(([key, entry]) => {
            let { description, value } = entry as DescriptiveObject

            const capitalKey = capitalCase(key)

            value = Array.isArray(value) ? value.join("\n") : value

            this.addField(capitalKey, locale.translate("embed_module_config_field", key, description, value))
        })
    }
}