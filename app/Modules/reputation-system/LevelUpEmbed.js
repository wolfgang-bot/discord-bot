const BaseEmbed = require("../../Embeds/BaseEmbed.js")

class LevelUpEmbed extends BaseEmbed {
    constructor(config, user, level) {
        super(config)

        this.setTitle("Level Up")
            .setDescription(`
                ${user} hat ${config.reputationSystem.roles[level]} erreicht! :partying_face:
                Herzlichen Dank für dein Engagement!
            `)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
    }
}

module.exports = LevelUpEmbed