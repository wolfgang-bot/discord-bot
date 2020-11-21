const BaseEmbed = require("../../Embeds/BaseEmbed.js")
const config = require("../../../config")

class LevelUpEmbed extends BaseEmbed {
    constructor(user, level) {
        super()

        this.setTitle("Level Up")
            .setDescription(`
                ${user} hat ${config.reputationSystem.roles[level]} erreicht! :partying_face:
                Herzlichen Dank für dein Engagement!
            `)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
    }
}

module.exports = LevelUpEmbed