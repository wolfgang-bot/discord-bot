const BaseEmbed = require("./BaseEmbed.js")
const { makeCodeblock } = require("../utils")

class ModuleEmbed extends BaseEmbed {
    constructor({ available, loaded }) {
        super()

        this.setTitle("Module")
            .addField("Verfügbar", makeCodeblock(available.join("\n")))
            .addField("Aktiv", makeCodeblock(loaded.join("\n")))
    }
}

module.exports = ModuleEmbed