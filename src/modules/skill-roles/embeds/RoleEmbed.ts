import { BaseEmbed } from "@personal-discord-bot/shared/dist"
import { LocaleProvider } from "@personal-discord-bot/shared/dist"

export default class RoleEmbed extends BaseEmbed {
    constructor(config, locale: LocaleProvider) {
        super(config)

        this.setTitle(locale.translate("embed_role_title"))
            .setDescription(locale.translate("embed_role_desc"))
    }
}
