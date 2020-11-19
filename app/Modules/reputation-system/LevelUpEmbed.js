const BaseEmbed = require("../../Embeds/BaseEmbed.js")
const config = require("../../../config")

class LevelUpEmbed extends BaseEmbed {
    constructor(user, level) {
        super()

        this.setTitle("Level Up")
            .setDescription(`
                ${user} ist jetzt ${config.reputationSystem.roleArticles[level]} ${config.reputationSystem.roles[level]}! :partying_face:
                Herzlichen Dank für dein Engagement!
            `)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
    }
}

module.exports = LevelUpEmbed