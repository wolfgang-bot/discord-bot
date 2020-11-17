const BaseEmbed = require("./BaseEmbed.js")
const { makeCodeblock } = require("../utils")

class PluginsEmbed extends BaseEmbed {
    constructor(plugins) {
        super()

        this.setTitle("Plugins")
            .setDescription(makeCodeblock(plugins.join("\n")))
    }
}

module.exports = PluginsEmbed