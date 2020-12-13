const BaseEmbed = require("../../../embeds/BaseEmbed.js")

class RoleEmbed extends BaseEmbed {
    constructor(config, locale) {
        super(config)

        this.setTitle(locale.translate("embed_role_title"))
            .setDescription(locale.translate("embed_role_desc"))
    }
}

module.exports = RoleEmbed