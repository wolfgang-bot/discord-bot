import { OHLCDataset } from "../../../lib/datasets"
import { Readable } from "../../../lib/Stream"
import Event, { EVENT_TYPES, UserEventMeta } from "../../../models/Event"
import BroadcastChannel from "../../../services/BroadcastChannel"

type Dataset = OHLCDataset<Event<UserEventMeta>>

export default class UserStream extends Readable<Dataset> {
    events: Event<UserEventMeta>[]

    constructor() {
        super({ useMonoBuffer: true })

        this.handleUserEvent = this.handleUserEvent.bind(this)
    }

    construct() {
        this.pushInitialValues().then(() => {
            BroadcastChannel.on("statistics/user-add", this.handleUserEvent)
        })
    }

    destroy() {
        BroadcastChannel.removeListener("statistics/user-add", this.handleUserEvent)
    }

    collectBuffer(buffer: Dataset) {
        return buffer
    }

    createDataset(events: Event<UserEventMeta>[]) {
        return new OHLCDataset(
            events,
            events => events.map(event => event.meta.userCount)
        )
    }

    pushDataset() {
        this.push(this.createDataset(this.events))
    }

    async pushInitialValues() {
        const events = await Event.findByTypes<UserEventMeta>([
            EVENT_TYPES.USER_ADD
        ])

        events.reverse()

        this.events = events
        this.pushDataset()
    }

    handleUserEvent(event: Event<UserEventMeta>) {
        this.events.push(event)
        this.pushDataset()
    }
}
