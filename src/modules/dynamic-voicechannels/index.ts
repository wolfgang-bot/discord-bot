import Module from "../../lib/Module"
import { argument, module } from "../../lib/decorators"
import { TYPES as ARGUMENT_TYPES } from "@personal-discord-bot/shared/dist/module/Argument"
import Configuration from "./models/Configuration"
import VoiceChannelManager from "./managers/VoiceChannelManager"

@module({
    key: "dynamic-voicechannels",
    name: "meta_name",
    desc: "meta_desc",
    features: "meta_features"
})
@argument({
    type: ARGUMENT_TYPES.CATEGORY_CHANNEL,
    key: "category_id",
    name: "arg_category_channel_display_name",
    desc: "arg_category_channel_desc"
})
class DynamicVoicechannelsModule extends Module {
    static makeConfigFromArgs = Configuration.fromArgs
    static makeConfigFromJSON = Configuration.fromJSON

    voiceChannelManager: VoiceChannelManager
    config: Configuration

    async start() {
        this.voiceChannelManager = new VoiceChannelManager(this.context, this.config.parentChannel)
        
        await this.voiceChannelManager.init()
    }

    async stop() {
        await this.voiceChannelManager.delete()
    }
}

export default DynamicVoicechannelsModule
