import { argument, module } from "../../lib/decorators"
import Module from "../../lib/Module"
import { TYPES as ARGUMENT_TYPES } from "../../lib/Argument"
import Configuration from "./models/Configuration"
import ChannelManager from "./managers/ChannelManager"

@module({
    key: "member-count",
    name: "Member Count",
    desc: "Creates a new text-channel with the member count as it's name",
    position: 3,
    maxInstances: 3,
    features: [
        "Creates a new text-channel with the member counts as it's name",
        "Updates the text-channel's name whenever the member count changes"
    ]
})
@argument({
    type: ARGUMENT_TYPES.STRING,
    key: "channelName",
    name: "Channel Name",
    desc: "Name for the new channel ({} will be replaced by the member count)",
    defaultValue: "Member Count: {}"
})
export default class MemberCount extends Module {
    static config = Configuration

    config: Configuration
    channelManager: ChannelManager

    async start() {
        this.channelManager = new ChannelManager(this.context, this.config)
        await this.channelManager.init()
    }

    async stop() {
        await this.channelManager.delete()
    }
}
