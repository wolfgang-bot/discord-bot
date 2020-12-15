const BaseEmbed = require("../../../lib/BaseEmbed.js")

class LevelUpEmbed extends BaseEmbed {
    constructor(config, locale, user, level) {
        super(config)

        this.setTitle(locale.translate("embed_levelup_title"))
            .setDescription(locale.translate("embed_levelup_desc", user, config["reputation-system"].roles[level]))
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
    }
}

module.exports = LevelUpEmbed