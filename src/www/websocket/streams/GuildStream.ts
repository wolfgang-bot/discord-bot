import Collection from "../../../lib/Collection"
import { Readable } from "../../../lib/Stream"
import Event, { EVENT_TYPES } from "../../../models/Event"
import BroadcastChannel from "../../../services/BroadcastChannel"
import config from "../../config"

export default class GuildStream extends Readable<Event[]> {
    constructor() {
        super()

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

    collectBuffer(buffer: Event[][]) {
        return buffer.flat()
    }

    async pushInitialValues() {
        const events = await Event.whereAll(`
            (
                type = '${EVENT_TYPES.GUILD_ADD}' OR
                type = '${EVENT_TYPES.GUILD_REMOVE}'
            ) ORDER BY timestamp DESC
            LIMIT ${config.stream.maxInitialValues}
        `) as Collection<Event>

        events.reverse()

        this.push(events)
    }

    handleGuildEvent(event: Event) {
        this.push([event])
    }
}
