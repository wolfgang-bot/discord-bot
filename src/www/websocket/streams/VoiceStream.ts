import Collection from "@personal-discord-bot/shared/dist/orm/Collection"
import Readable from "@personal-discord-bot/shared/dist/streams/Readable"
import Event, { EVENT_TYPES, VoiceChannelLeaveEventMeta } from "@personal-discord-bot/shared/dist/models/Event"
import BroadcastChannel from "../../../services/BroadcastChannel"
import config from "../../config"

export default class VoiceStream extends Readable<Event<VoiceChannelLeaveEventMeta>[]> {
    constructor(public guildId: string) {
        super()

        this.handleVoiceEvent = this.handleVoiceEvent.bind(this)
    }

    construct() {
        this.pushInitialValues().then(() => {
            BroadcastChannel.on("statistics/guild-channel-leave", this.handleVoiceEvent)
        })
    }
    
    destroy() {
        BroadcastChannel.removeListener("statistics/guild-channel-leave", this.handleVoiceEvent)
    }

    collectBuffer(buffer: Event<VoiceChannelLeaveEventMeta>[][]) {
        return buffer.flat()
    }

    async pushInitialValues() {
        const events = await Event.whereAll(`
            type = ${EVENT_TYPES.VOICECHANNEL_LEAVE} AND
            guild_id = ${this.guildId}
            ORDER BY timestamp ASC
            LIMIT ${config.stream.maxInitialValues}
        `) as Collection<Event<VoiceChannelLeaveEventMeta>>
        this.push(events)
    }

    handleVoiceEvent(event: Event<VoiceChannelLeaveEventMeta>) {
        if (event.guild_id === this.guildId) {
            this.push([event])
        }
    }
}
