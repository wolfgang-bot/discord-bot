import Discord from "discord.js"
import { BaseEmbed, LocaleProvider } from "@personal-discord-bot/shared/dist"

export default class LevelUpEmbed extends BaseEmbed {
    constructor(config, locale: LocaleProvider, user: Discord.User, level: number) {
        super(config)

        this.setTitle(locale.translate("embed_levelup_title"))
            .setDescription(locale.translate("embed_levelup_desc", user.toString(), config["reputation-system"].roles[level]))
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
    }
}
