const BaseEmbed = require("./BaseEmbed.js")
const { makeCodeblock } = require("../utils")

class ModulesEmbed extends BaseEmbed {
    constructor(config, { modules, moduleInstances }) {
        super(config)

        this.setTitle("Module")
            .addField("Verfügbar", makeCodeblock(modules.map(module => module.name).join("\n")), true)
            .addField("Aktiv", makeCodeblock(moduleInstances.map(({ module }) => module.name).join("\n")), true)
    }
}

module.exports = ModulesEmbed