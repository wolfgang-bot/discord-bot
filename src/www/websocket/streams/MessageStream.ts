import Collection from "@personal-discord-bot/shared/dist/orm/Collection"
import Readable from "@personal-discord-bot/shared/dist/streams/Readable"
import Event, { EVENT_TYPES } from "@personal-discord-bot/shared/dist/models/Event"
import BroadcastChannel from "../../../services/BroadcastChannel"
import config from "../../config"

export default class MessageStream extends Readable<Float64Array> {
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

    collectBuffer(buffer: Float64Array[]) {
        const values = buffer.reduce(
            (values, array) => {
                values.push(...array)
                return values
            },
            [] as number[]
        )

        return new Float64Array(values)
    }

    async pushInitialValues() {
        const events = await Event.whereAll(`
            type = ${EVENT_TYPES.MESSAGE_SEND} AND
            guild_id = ${this.guildId}
            ORDER BY timestamp DESC
            LIMIT ${config.stream.maxInitialValues}
        `) as Collection<Event>

        events.reverse()

        this.push(this.eventsToBinary(events))
    }

    handleMessageEvent(event: Event) {
        if (event.guild_id === this.guildId) {
            this.push(this.eventsToBinary([event]))
        }
    }

    eventsToBinary(events: Event[]) {
        const timestamps = events.map(event => event.timestamp)
        return new Float64Array(timestamps)
    }
}
