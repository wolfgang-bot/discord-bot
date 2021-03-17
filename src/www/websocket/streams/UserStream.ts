import Collection from "../../../lib/Collection"
import { OHLCDataset } from "../../../lib/datasets"
import { Readable } from "../../../lib/Stream"
import Event, { EVENT_TYPES, UserEventMeta } from "../../../models/Event"
import BroadcastChannel from "../../../services/BroadcastChannel"
import config from "../../config"

type Dataset = OHLCDataset<Event<UserEventMeta>>

export default class UserStream extends Readable<Dataset> {
    constructor() {
        super()

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

    collectBuffer(buffer: Dataset[]) {
        return buffer[buffer.length - 1]
    }

    createDataset(events: Event<UserEventMeta>[]) {
        return new OHLCDataset(
            events,
            events => events.map(event => event.meta.userCount)
        )
    }

    async pushInitialValues() {
        const events = await Event.findByTypes<UserEventMeta>([
            EVENT_TYPES.USER_ADD
        ], {
            limit: config.stream.maxInitialValues
        })

        events.reverse()

        this.push(this.createDataset(events))
    }

    handleUserEvent(event: Event<UserEventMeta>) {
        this.push(this.createDataset([event]))
    }
}
