import BaseEmbed from "../../../lib/BaseEmbed"
import LocaleProvider from "../../../services/LocaleProvider"
import SettingsConfig from "../../settings/models/Configuration"

export default class RoleEmbed extends BaseEmbed {
    constructor(settings: SettingsConfig, locale: LocaleProvider) {
        super(settings)

        this.setTitle(locale.translate("embed_role_title"))
            .setDescription(locale.translate("embed_role_desc"))
    }
}
