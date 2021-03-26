import Discord from "discord.js"
import { SVDataset } from "../../../lib/datasets"
import { Readable } from "../../../lib/Stream"
import Event, { EVENT_TYPES } from "../../../models/Event"
import BroadcastChannel from "../../../services/BroadcastChannel"
import { AuthorizedSocket } from "../SocketManager"
import { SubscriptionArgs } from "../types"

type Dataset = SVDataset<Event>

export default class MessageStream extends Readable<Dataset> {
    events: Event[] = []
    
    constructor(
        public client: Discord.Client,
        public socket: AuthorizedSocket,
        public args: SubscriptionArgs
    ) {
        super({ useMonoBuffer: true })

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

    collectBuffer(buffer: Dataset) {
        return buffer
    }

    createDataset(events: Event[]) {
        return new SVDataset(events)
    }

    pushDataset() {
        this.push(this.createDataset(this.events))
    }

    async pushInitialValues() {
        const events = await Event.findByTypes([
            EVENT_TYPES.MESSAGE_SEND
        ], {
            guildId: this.args.guildId
        })
        
        events.reverse()

        this.events = events
        this.pushDataset()
    }

    handleMessageEvent(event: Event) {
        if (event.guild_id === this.args.guildId) {
            this.events.push(event)
            this.pushDataset()
        }
    }
}
