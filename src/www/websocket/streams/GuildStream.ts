import { OHLCDataset, SVDataset } from "../../../lib/datasets"
import { Readable } from "../../../lib/Stream"
import Event, { EVENT_TYPES, GuildEventMeta } from "../../../models/Event"
import BroadcastChannel from "../../../services/BroadcastChannel"

type Dataset = [
    OHLCDataset<Event<GuildEventMeta>>,
    SVDataset<Event<GuildEventMeta>>
]

export default class GuildStream extends Readable<Dataset> {
    events: Event<GuildEventMeta>[] = []
    
    constructor() {
        super({ useMonoBuffer: true })

        this.handleGuildEvent = this.handleGuildEvent.bind(this)
    }

    construct() {
        this.pushInitialValues().then(() => {
            BroadcastChannel.on("statistics/guild-add", this.handleGuildEvent)
            BroadcastChannel.on("statistics/guild-remove", this.handleGuildEvent)
        })
    }
    
    destroy() {
        BroadcastChannel.removeListener("statistics/guild-add", this.handleGuildEvent)
        BroadcastChannel.removeListener("statistics/guild-remove", this.handleGuildEvent)
    }

    collectBuffer(buffer: Dataset) {
        return buffer
    }

    createDataset(events: Event<GuildEventMeta>[]) {
        return [
            new OHLCDataset(
                events,
                (event) => event.meta.guildCount
            ),
            new SVDataset(
                events,
                null,
                (event) => event.type === EVENT_TYPES.GUILD_ADD
            )
        ] as Dataset
    }

    pushDataset() {
        this.push(this.createDataset(this.events))
    }

    async pushInitialValues() {
        const events = await Event.findByTypes([
            EVENT_TYPES.GUILD_ADD,
            EVENT_TYPES.GUILD_REMOVE
        ])

        events.reverse()

        this.events = events
        this.pushDataset()
    }

    handleGuildEvent(event: Event<GuildEventMeta>) {
        this.events.push(event)
        this.pushDataset()
    }
}
