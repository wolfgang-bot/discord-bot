import Module from "../../lib/Module"
import { argument, module } from "../../lib/decorators"
import { TYPES as ARGUMENT_TYPES } from "../../lib/Argument"
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
    key: "parentChannel",
    name: "arg_category_channel_display_name",
    desc: "arg_category_channel_desc"
})
@argument({
    type: ARGUMENT_TYPES.NUMBER,
    key: "defaultChannels",
    name: "arg_amount_of_voicechannels_name",
    desc: "arg_amount_of_voicechannels_desc",
    defaultValue: 3
})
@argument({
    type: ARGUMENT_TYPES.STRING,
    key: "channelName",
    name: "arg_channel_name_name",
    desc: "arg_channel_name_desc",
    defaultValue: "🔊┃voice {}"
})
class DynamicVoicechannelsModule extends Module {
    static config = Configuration

    voiceChannelManager: VoiceChannelManager
    config: Configuration

    async start() {
        this.voiceChannelManager = new VoiceChannelManager(this.context, this.config)
        
        await this.voiceChannelManager.init()
    }

    async stop() {
        await this.voiceChannelManager.delete()
    }
}

export default DynamicVoicechannelsModule
