import SVDataset from "../../../lib/datasets/SVDataset";
import { Readable } from "../../../lib/Stream";
import Event, { EVENT_TYPES, VoiceChannelLeaveEventMeta } from "../../../models/Event"
import BroadcastChannel from "../../../services/BroadcastChannel"

type Dataset = SVDataset<Event<VoiceChannelLeaveEventMeta>>

export default class VoiceStream extends Readable<Dataset> {
    events: Event<VoiceChannelLeaveEventMeta>[] = []
    
    constructor(public guildId: string) {
        super({ useMonoBuffer: true })

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

    collectBuffer(buffer: Dataset) {
        return buffer
    }

    createDataset(events: Event<VoiceChannelLeaveEventMeta>[]) {
        return new SVDataset(
            events,
            (event) => event.meta.duration
        )
    }

    pushDataset() {
        this.push(this.createDataset(this.events))
    }

    async pushInitialValues() {
        const events = await Event.findByTypes([
            EVENT_TYPES.VOICECHANNEL_LEAVE
        ])

        events.reverse()

        this.events = events
        this.pushDataset()
    }

    handleVoiceEvent(event: Event<VoiceChannelLeaveEventMeta>) {
        if (event.guild_id === this.guildId) {
            this.events.push(event)
            this.pushDataset()
        }
    }
}
