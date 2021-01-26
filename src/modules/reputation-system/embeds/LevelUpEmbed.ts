import Discord from "discord.js"
import BaseEmbed from "../../../lib/BaseEmbed"
import LocaleServiceProvider from "../../../services/LocaleServiceProvider"

export default class LevelUpEmbed extends BaseEmbed {
    constructor(config, locale: LocaleServiceProvider, user: Discord.User, level: number) {
        super(config)

        this.setTitle(locale.translate("embed_levelup_title"))
            .setDescription(locale.translate("embed_levelup_desc", user.toString(), config["reputation-system"].roles[level]))
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
    }
}