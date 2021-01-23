import Module from "../../lib/Module"
import Configuration from "./models/Configuration"
import VoiceChannelManager from "./managers/VoiceChannelManager"

class DynamicVoicechannelsModule extends Module {
    voiceChannelManager: VoiceChannelManager
    config: Configuration

    static makeConfigFromArgs = Configuration.fromArgs
    static makeConfigFromJSON = Configuration.fromJSON

    async start() {
        this.voiceChannelManager = new VoiceChannelManager(this.context, this.config.parentChannel)
        
        await this.voiceChannelManager.init()
    }

    async stop() {
        await this.voiceChannelManager.delete()
    }
}

export default DynamicVoicechannelsModule