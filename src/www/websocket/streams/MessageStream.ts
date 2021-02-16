import Collection from "../../../lib/Collection"
import { Readable } from "../../../lib/Stream"
import Event, { EVENT_TYPES } from "../../../models/Event"
import BroadcastChannel from "../../../services/BroadcastChannel"
import config from "../../config"

export default class MessageStream extends Readable<Event> {
    constructor(public guildId: string) {
        super()

        this.handleMessageEvent = this.handleMessageEvent.bind(this)
    }

    construct() {
        this.pushInitialValues().then(() => {
            BroadcastChannel.on("statistics/message-send", this.handleMessageEvent)
        })
    }

    destroy() {
        BroadcastChannel.removeListener("statistics/message-send", this.handleMessageEvent)
    }

    async pushInitialValues() {
        const events = await Event.whereAll(`
            type = ${EVENT_TYPES.MESSAGE_SEND} AND
            guild_id = ${this.guildId}
            ORDER BY timestamp ASC
            LIMIT ${config.stream.maxInitialValues}
        `) as Collection<Event>

        this.push(events)
    }

    handleMessageEvent(event: Event) {
        if (event.guild_id === this.guildId) {
            this.push([event])
        }
    }
}