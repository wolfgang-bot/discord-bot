import Discord from "discord.js"
import { Readable } from "../../lib/Stream"
import { AuthorizedSocket } from "./SocketManager"
import SocketStream from "./streams/SocketStream"
import GuildStream from "./streams/GuildStream"
import UserStream from "./streams/UserStream"
import GuildModuleInstanceStream from "./streams/GuildModuleInstanceStream"
import MemberStream from "./streams/MemberStream"
import MessageStream from "./streams/MessageStream"
import VoiceStream from "./streams/VoiceStream"
import ModuleInstanceStream from "./streams/ModuleInstanceStream"

export type SubscriptionArgs = {
    eventStream: EVENT_STREAMS,
    guildId?: string
}

export enum EVENT_STREAMS {
    GUILDS = "guilds",
    USERS = "users",
    MODULE_INSTANCES = "module-instances",
    GUILD_MODULE_INSTANCES = "guild-module-instances",
    MEMBERS = "members",
    MESSAGES = "messages",
    VOICE = "voice"
}

const streams: Record<EVENT_STREAMS, new (guildId: string) => Readable<any>> = {
    [EVENT_STREAMS.GUILDS]: GuildStream,
    [EVENT_STREAMS.USERS]: UserStream,
    [EVENT_STREAMS.MODULE_INSTANCES]: ModuleInstanceStream,
    [EVENT_STREAMS.GUILD_MODULE_INSTANCES]: GuildModuleInstanceStream,
    [EVENT_STREAMS.MEMBERS]: MemberStream,
    [EVENT_STREAMS.MESSAGES]: MessageStream,
    [EVENT_STREAMS.VOICE]: VoiceStream
}

export default class StreamManager {
    static ADMIN_STREAM_GROUP = "admin"

    streams: Record<string, Partial<Record<EVENT_STREAMS, Readable<any>>>> = {}

    constructor(public client: Discord.Client, public socket: AuthorizedSocket) {}

    subscribe(args: SubscriptionArgs) {
        if (this.getStream(args)) {
            throw new Error("Cannot subscribe to the same stream twice")
        }

        const eventStream = this.createStream(args)
        const socketStream = new SocketStream(this.socket, args)        
        eventStream.pipe(socketStream)
    }

    unsubscribe(args: SubscriptionArgs) {
        this.getStream(args).destroy()
        this.deleteStream(args)
    }

    pause(args: SubscriptionArgs) {
        this.getStream(args).pause()
    }

    resume(args: SubscriptionArgs) {
        this.getStream(args).resume()
    }

    unsubscribeAll() {
        this.forEachStream(stream => stream.destroy())
        this.streams = {}
    }

    createStream(args: SubscriptionArgs) {
        const stream = new streams[args.eventStream](args.guildId)
        this.getGroup(args)[args.eventStream] = stream
        return stream
    }

    getStream(args: SubscriptionArgs) {
        return this.getGroup(args)[args.eventStream]
    }

    deleteStream(args: SubscriptionArgs) {
        delete this.getGroup(args)[args.eventStream]
    }

    getGroup(args: SubscriptionArgs) {
        const groupKey = this.getGroupKey(args)

        if (!this.streams[groupKey]) {
            this.streams[groupKey] = {}
        }
        
        return this.streams[groupKey]
    }

    getGroupKey(args: SubscriptionArgs) {
        return args.guildId || StreamManager.ADMIN_STREAM_GROUP
    }

    forEachStream(callback: (stream: Readable<any>) => void) {
        Object.values(this.streams).forEach(streamMap => {
            Object.values(streamMap).forEach(stream => {
                callback(stream)
            })
        })
    }
}
