import BaseEmbed from "../../../lib/BaseEmbed"
import LocaleProvider from "../../../services/LocaleProvider"
import SettingsConfig from "../../settings/models/Configuration"

export default class SetupEmbed extends BaseEmbed {
    constructor(settings: SettingsConfig, locale: LocaleProvider, state: 0 | 1) {
        super(settings)

        this.setTitle(locale.translate("embed_setup_title"))
            .setDescription(locale.translate("embed_setup_desc_" + state))
    }
}
