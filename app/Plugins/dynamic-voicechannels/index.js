const Plugin = require("../../lib/Plugin.js")

class DynamicVoicechannelPlugin extends Plugin {
    start(args) {
        console.log("[Dynamic Voicechanenels Plugin]", args)
    }
}

module.exports = DynamicVoicechannelPlugin