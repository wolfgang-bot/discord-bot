import { capitalCase } from "change-case"
import BaseEmbed from "../../../lib/BaseEmbed"
import DescriptiveObject from "../../../lib/DescriptiveObject"
import LocaleProvider from "../../../services/LocaleProvider"
import SettingsConfig from "../../settings/models/Configuration"

export default class ModuleConfigEmbed extends BaseEmbed {
    constructor(settings: SettingsConfig, locale: LocaleProvider, moduleKey: string, moduleConfig: DescriptiveObject) {
        super(settings)
        
        this.setTitle(locale.translate("embed_module_config_title", moduleKey))

        Object.entries(moduleConfig.value).forEach(([key, entry]) => {
            let { description, value } = entry as DescriptiveObject

            const capitalKey = capitalCase(key)

            value = Array.isArray(value) ? value.join("\n") : value

            this.addField(capitalKey, locale.translate("embed_module_config_field", key, description, value))
        })
    }
}
