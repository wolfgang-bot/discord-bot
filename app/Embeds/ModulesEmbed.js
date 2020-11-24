const BaseEmbed = require("./BaseEmbed.js")
const { makeCodeblock } = require("../utils")

class ModulesEmbed extends BaseEmbed {
    constructor(config, { modules, moduleInstances }) {
        super(config)

        this.setTitle("Module")
            .addField("Verfügbar", makeCodeblock(modules.map(module => module.name).join("\n")))
            .addField("Aktiv", makeCodeblock(moduleInstances.map(({ module }) => module.name).join("\n")))
    }
}

module.exports = ModulesEmbed