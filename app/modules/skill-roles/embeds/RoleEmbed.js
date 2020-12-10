const BaseEmbed = require("../../../embeds/BaseEmbed.js")

class RoleEmbed extends BaseEmbed {
    constructor(config, locale) {
        super(config)

        this.setTitle(locale.translate("module_skill_roles_embed_role_title"))
            .setDescription(locale.translate("module_skill_roles_embed_role_desc"))
    }
}

module.exports = RoleEmbed