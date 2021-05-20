import Module from "../../lib/Module"
import { argument, module } from "../../lib/decorators"
import { TYPES as ARGUMENT_TYPES } from "../../lib/Argument"
import Configuration from "./models/Configuration"
import VoiceChannelManager from "./managers/VoiceChannelManager"

@module({
    key: "dynamic-voicechannels",
    name: "Dynamic Voicechannels",
    desc: "Ensures that there always is an empty voicechannel.",
    position: 5,
    maxInstances: 3,
    features: [
        "Creates a predefined amount of persistant voicechannels in the given category.",
        "Creates a new voicechannels if there is at least one member in every other voicechannel.",
        "Removes the dynamically created voicechannels if they are not needed anymore."
    ]
})
@argument({
    type: ARGUMENT_TYPES.CATEGORY_CHANNEL,
    key: "parentChannel",
    name: "Category",
    desc: "The category in which the voicechannels will be created"
})
@argument({
    type: ARGUMENT_TYPES.NUMBER,
    key: "defaultChannels",
    name: "Amount Of Voicechannels",
    desc: "The amount of persistant channels",
    defaultValue: 3
})
@argument({
    type: ARGUMENT_TYPES.STRING,
    key: "channelName",
    name: "Channel Name",
    desc: "Template for the voice channel names ('{}' will be replaced by a channel's index)",
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
