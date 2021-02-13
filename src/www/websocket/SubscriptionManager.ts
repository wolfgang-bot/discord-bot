import Discord from "discord.js"
import { EventEmitter } from "events"
import { AuthorizedSocket } from "./SocketManager"
import { SubscriptionArgs, EVENT_STREAMS } from "./controllers/SubscriptionController"
import BroadcastChannel from "../../services/BroadcastChannel"
import Event from "../../models/Event"

// TODO: Make seperate folder "/streams"
// TODO: Make superclass for streams (extend EventEmitter, abstract methods: subscribe, unsubscribe)

class MembersStream extends EventEmitter {
    constructor(public guildId: string) {
        super()

        this.handleMembersEvent = this.handleMembersEvent.bind(this)

        this.subscribe()
    }

    subscribe() {
        BroadcastChannel.on("statistics/guild-member-add", this.handleMembersEvent)
        BroadcastChannel.on("statistics/guild-member-remove", this.handleMembersEvent)
    }

    unsubscribe() {
        BroadcastChannel.removeListener("statistics/guild-member-add", this.handleMembersEvent)
        BroadcastChannel.removeListener("statistics/guild-member-remove", this.handleMembersEvent)
    }

    handleMembersEvent(event: Event) {
        if (event.guild_id === this.guildId) {
            this.emit("data", event)
        }
    }
}

export default class SubscriptionManager {
    streams: Record<string, Record<string, MembersStream>> = {}

    constructor(public client: Discord.Client, public socket: AuthorizedSocket) {}

    subscribe(args: SubscriptionArgs) {
        console.log(args)
        
        if (args.eventStream === EVENT_STREAMS.MEMBERS) {
            const stream = new MembersStream(args.guildId)
            stream.on("data", this.push.bind(this, EVENT_STREAMS.MEMBERS))
            
            if (!this.streams[args.guildId]) {
                this.streams[args.guildId] = {}
            }

            this.streams[args.guildId][EVENT_STREAMS.MEMBERS] = stream
        }
    }

    unsubscribe(args: SubscriptionArgs) {
        if (args.eventStream === EVENT_STREAMS.MEMBERS) {
            this.streams[args.guildId][EVENT_STREAMS.MEMBERS].unsubscribe()
            delete this.streams[args.guildId][EVENT_STREAMS.MEMBERS]
        }
    }

    push(eventStream: EVENT_STREAMS, data: any) {
        this.socket.emit(`push:stream/${eventStream}`, data)
    }
}