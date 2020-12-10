const BaseEmbed = require("../../../embeds/BaseEmbed.js")

class LevelUpEmbed extends BaseEmbed {
    constructor(config, locale, user, level) {
        super(config)

        this.setTitle(locale.translate("module_reputation_system_embed_levelup_title"))
            .setDescription(locale.translate("module_reputation_system_embed_levelup_desc", user, config["reputation-system"].roles[level]))
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
    }
}

module.exports = LevelUpEmbed