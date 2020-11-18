const BaseEmbed = require("../../Embeds/BaseEmbed.js")

class HelpEmbed extends BaseEmbed {
    constructor() {
        super()

        this.setTitle("Fragen-Kanäle")
            .addField("Frage stellen", "Schicke deine Frage in diesen Kanal und wir richten alles für dich ein")
            .addField("Wie stelle ich eine Frage", "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.")
    }
}

module.exports = HelpEmbed