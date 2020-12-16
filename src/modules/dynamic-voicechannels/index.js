const Configuration = require("./models/Configuration.js")
const VoiceChannelManager = require("./managers/VoiceChannelManager.js")

class DynamicVoicechannelsModule {
    static makeConfigFromArgs = Configuration.fromArgs
    static makeConfigFromJSON = Configuration.fromJSON

    constructor(context, config) {
        this.context = context
        this.config = config

        this.voiceChannelManager = new VoiceChannelManager(this.context, this.config.parentChannel)
    }

    async start() {
        await this.voiceChannelManager.init()
    }

    async stop() {
        await this.voiceChannelManager.delete()
    }

    getConfig() {
        return this.config
    }
}

module.exports = DynamicVoicechannelsModule