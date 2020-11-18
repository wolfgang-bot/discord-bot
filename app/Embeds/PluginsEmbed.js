const BaseEmbed = require("./BaseEmbed.js")
const { makeCodeblock } = require("../utils")

class PluginsEmbed extends BaseEmbed {
    constructor({ available, loaded }) {
        super()

        this.setTitle("Plugins")
            .addField("Verfügbar", makeCodeblock(available.join("\n")))
            .addField("Aktiv", makeCodeblock(loaded.join("\n")))
    }
}

module.exports = PluginsEmbed