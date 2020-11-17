const Plugin = require("../../lib/Plugin.js")

class DynamicVoicechannelPlugin extends Plugin {
    init(args) {
        console.log("[Dynamic Voicechanenels Plugin]", args)
    }
}

module.exports = DynamicVoicechannelPlugin