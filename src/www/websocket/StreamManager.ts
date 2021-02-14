import Discord from "discord.js"
import { Readable } from "../../lib/Stream"
import Event, { GuildMemberEventMeta } from "../../models/Event"
import { AuthorizedSocket } from "./SocketManager"
import { SubscriptionArgs, EVENT_STREAMS } from "./controllers/SubscriptionController"
import SocketStream from "./streams/SocketStream"
import MembersStream from "./streams/MembersStream"

export default class StreamManager {
    streams: Record<string, Record<string, Readable<any>>> = {}

    constructor(public client: Discord.Client, public socket: AuthorizedSocket) {}

    subscribe(args: SubscriptionArgs) {
        console.log("Subscribe", args)
        
        if (args.eventStream === EVENT_STREAMS.MEMBERS) {
            const membersStream = new MembersStream(args.guildId)
            const socketStream = new SocketStream<Event<GuildMemberEventMeta>>(this.socket, EVENT_STREAMS.MEMBERS)

            membersStream.pipe(socketStream)
            
            if (!this.streams[args.guildId]) {
                this.streams[args.guildId] = {}
            }

            this.streams[args.guildId][EVENT_STREAMS.MEMBERS] = membersStream
        }
    }

    unsubscribe(args: SubscriptionArgs) {
        console.log("Unsubscribe", args)

        if (args.eventStream === EVENT_STREAMS.MEMBERS) {
            this.streams[args.guildId][EVENT_STREAMS.MEMBERS].destroy()
            delete this.streams[args.guildId][EVENT_STREAMS.MEMBERS]
        }
    }
}