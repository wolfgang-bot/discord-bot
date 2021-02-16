import Discord from "discord.js"
import { Readable } from "../../lib/Stream"
import { AuthorizedSocket } from "./SocketManager"
import SocketStream from "./streams/SocketStream"
import ModuleInstanceStream from "./streams/ModuleInstanceStream"
import MemberStream from "./streams/MemberStream"
import MessageStream from "./streams/MessageStream"
import VoiceStream from "./streams/VoiceStream"

export type SubscriptionArgs = {
    eventStream: EVENT_STREAMS,
    guildId: string
}

export enum EVENT_STREAMS {
    MODULE_INSTANCES = "module-instances",
    MEMBERS = "members",
    MESSAGES = "messages",
    VOICE = "voice"
}

const STREAMS: Record<EVENT_STREAMS, new (guildId: string) => Readable<any>> = {
    [EVENT_STREAMS.MODULE_INSTANCES]: ModuleInstanceStream,
    [EVENT_STREAMS.MEMBERS]: MemberStream,
    [EVENT_STREAMS.MESSAGES]: MessageStream,
    [EVENT_STREAMS.VOICE]: VoiceStream
}

export default class StreamManager {
    streams: Record<string, Partial<Record<EVENT_STREAMS, Readable<any>>>> = {}

    constructor(public client: Discord.Client, public socket: AuthorizedSocket) {}

    subscribe(args: SubscriptionArgs) {
        const eventStream = new STREAMS[args.eventStream](args.guildId)
        const socketStream = new SocketStream(this.socket, args)

        if (!this.streams[args.guildId]) {
            this.streams[args.guildId] = {}
        }

        if (this.streams[args.guildId][args.eventStream]) {
            throw new Error("Cannot subscribe to the same stream twice")
        }

        this.streams[args.guildId][args.eventStream] = eventStream
        
        eventStream.pipe(socketStream)
    }

    unsubscribe(args: SubscriptionArgs) {
        this.streams[args.guildId][args.eventStream].destroy()
        delete this.streams[args.guildId][args.eventStream]
    }

    pause(args: SubscriptionArgs) {
        this.streams[args.guildId][args.eventStream].pause()
    }

    resume(args: SubscriptionArgs) {
        this.streams[args.guildId][args.eventStream].resume()
    }

    unsubscribeAll() {
        for (let guildId in this.streams) {
            for (let eventStream in this.streams[guildId]) {
                this.unsubscribe({
                    guildId,
                    eventStream: eventStream as EVENT_STREAMS
                })
            }
        }
    }
}