import Collection from "../../../lib/Collection"
import { Readable } from "../../../lib/Stream"
import Event, { EVENT_TYPES, UserEventMeta } from "../../../models/Event"
import BroadcastChannel from "../../../services/BroadcastChannel"
import config from "../../config"

export default class UserStream extends Readable<Event<UserEventMeta>[]> {
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

    collectBuffer(buffer: Event<UserEventMeta>[][]) {
        return buffer.flat()
    }

    async pushInitialValues() {
        const events = await Event.whereAll(`
            type = '${EVENT_TYPES.USER_ADD}'
            ORDER BY timestamp DESC
            LIMIT ${config.stream.maxInitialValues}
        `) as Collection<Event>

        events.reverse()

        this.push(events)
    }

    handleUserEvent(event: Event<UserEventMeta>) {
        this.push([event])
    }
}
