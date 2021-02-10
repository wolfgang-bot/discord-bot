import BaseEmbed from "../../../lib/BaseEmbed"
import LocaleProvider from "../../../services/LocaleProvider"

export default class RoleEmbed extends BaseEmbed {
    constructor(config, locale: LocaleProvider) {
        super(config)

        this.setTitle(locale.translate("embed_role_title"))
            .setDescription(locale.translate("embed_role_desc"))
    }
}