import BaseEmbed from "../../../lib/BaseEmbed"
import LocaleProvider from "../../../services/LocaleProvider"
import SettingsConfig from "../../settings/models/Configuration"

export default class CodeblocksEmbed extends BaseEmbed {
    constructor(settings: SettingsConfig, locale: LocaleProvider) {
        super(settings)

        this.setTitle(locale.translate("embed_codeblocks_title"))
            .setDescription(locale.translate("embed_codeblocks_content"))
    }
}
