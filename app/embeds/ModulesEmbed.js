const BaseEmbed = require("./BaseEmbed.js")
const { makeCodeblock, makeURL } = require("../utils")

class ModulesEmbed extends BaseEmbed {
    constructor(config, { guild, modules, moduleInstances }) {
        super(config)

        this.setTitle("Module")
            .setDescription(`[Open Webinterface](${makeURL("/config/" + guild.id)})`)
            .addField("Verfügbar", makeCodeblock(modules.map(module => module.name).join("\n")), true)
            .addField("Aktiv", makeCodeblock(moduleInstances.map(({ module }) => module.name).join("\n")), true)
    }
}

module.exports = ModulesEmbed