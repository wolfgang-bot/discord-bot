const Module = require("../../lib/Module.js")
const Configuration = require("./models/Configuration.js")
const VoiceChannelManager = require("./managers/VoiceChannelManager.js")

class DynamicVoicechannelsModule extends Module {
    async start() {
        this.voiceChannelManager = new VoiceChannelManager(this.context, this.config.parentChannel)
        
        await this.voiceChannelManager.init()
    }

    async stop() {
        await this.voiceChannelManager.delete()
    }
}

Module.bindConfig(DynamicVoicechannelsModule, Configuration)

module.exports = DynamicVoicechannelsModule