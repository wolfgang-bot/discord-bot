import BaseEmbed from "../../../lib/BaseEmbed"
import LocaleProvider from "../../../services/LocaleProvider"

export default class SetupEmbed extends BaseEmbed {
    constructor(config, locale: LocaleProvider, state: 0 | 1) {
        super(config)

        this.setTitle(locale.translate("embed_setup_title"))
            .setDescription(locale.translate("embed_setup_desc_" + state))
    }
}
