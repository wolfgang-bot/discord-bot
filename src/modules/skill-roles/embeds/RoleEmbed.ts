import BaseEmbed from "../../../lib/BaseEmbed"
import LocaleServiceProvider from "../../../services/LocaleServiceProvider"

export default class RoleEmbed extends BaseEmbed {
    constructor(config, locale: LocaleServiceProvider) {
        super(config)

        this.setTitle(locale.translate("embed_role_title"))
            .setDescription(locale.translate("embed_role_desc"))
    }
}