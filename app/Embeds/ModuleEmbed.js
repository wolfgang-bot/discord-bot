const BaseEmbed = require("./BaseEmbed.js")
const { makeCodeblock } = require("../utils")

class ModuleEmbed extends BaseEmbed {
    constructor(config, { available, loaded }) {
        super(config)

        this.setTitle("Module")
            .addField("Verfügbar", makeCodeblock(available.join("\n")))
            .addField("Aktiv", makeCodeblock(loaded.join("\n")))
    }
}

module.exports = ModuleEmbed