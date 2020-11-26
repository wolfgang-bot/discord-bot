const BaseEmbed = require("../../Embeds/BaseEmbed.js")

class NotificationEmbed extends BaseEmbed {
    constructor(config, guild) {
        super(config)

        this.setTitle(`Du hast eine Frage auf '${guild.name}' gestellt`)
            .addField(`Problem gelöst?`, `Super! Reagiere mit ${config.questionChannels.resolveReaction} auf die Nachricht die dein Problem gelöst hat und wir entfernen deinen Fragenkanal wieder.`)
            .addField(`Frage nicht mehr relevant?`, `Sende ${config.questionChannels.deleteReaction} in deinen Fragenkanal um ihn selbstständig zu entfernen.`)
    }
}

module.exports = NotificationEmbed