import Discord from "discord.js"
import { Readable } from "../../lib/Stream"
import { EVENT_STREAMS, SubscriptionArgs } from "./types"
import { AuthorizedSocket } from "./SocketManager"

import GuildStream from "./streams/GuildStream"
import GuildResourceStream from "./streams/GuildResourceStream"
import UserStream from "./streams/UserStream"
import GuildModuleInstanceStream from "./streams/GuildModuleInstanceStream"
import MemberStream from "./streams/MemberStream"
import MessageStream from "./streams/MessageStream"
import VoiceStream from "./streams/VoiceStream"
import ModuleInstanceStream from "./streams/ModuleInstanceStream"
import UserGuildStream from "./streams/UserGuildStream"
import UserMessageLeaderboardStream from "./streams/UserMessageLeaderboardStream"
import UserVoiceLeaderboardStream from "./streams/UserVoiceLeaderboardStream"

const streams: Record<
    EVENT_STREAMS,
    new (client: Discord.Client, socket: AuthorizedSocket, args: SubscriptionArgs) => Readable<any>
> = {
    [EVENT_STREAMS.GUILDS]: GuildStream,
    [EVENT_STREAMS.GUILDS_RESOURCES]: GuildResourceStream,
    [EVENT_STREAMS.USERS]: UserStream,
    [EVENT_STREAMS.MODULE_INSTANCES]: ModuleInstanceStream,
    [EVENT_STREAMS.USER_GUILDS]: UserGuildStream,
    [EVENT_STREAMS.GUILD_MODULE_INSTANCES]: GuildModuleInstanceStream,
    [EVENT_STREAMS.MEMBERS]: MemberStream,
    [EVENT_STREAMS.MESSAGES]: MessageStream,
    [EVENT_STREAMS.VOICE]: VoiceStream,
    [EVENT_STREAMS.USER_MESSAGE_LEADERBOARD]: UserMessageLeaderboardStream,
    [EVENT_STREAMS.USER_VOICE_LEADERBOARD]: UserVoiceLeaderboardStream
}

export default class StreamRegistry {
    static ADMIN_STREAM_GROUP = "admin"

    streams: Record<string, Partial<Record<EVENT_STREAMS, Readable<any>>>> = {}

    constructor(public client: Discord.Client) {}

    createStream(socket: AuthorizedSocket, args: SubscriptionArgs) {
        const stream = new streams[args.eventStream](this.client, socket, args)
        this.getGroup(args)[args.eventStream] = stream
        return stream
    }

    getStream(args: SubscriptionArgs) {
        return this.getGroup(args)[args.eventStream]
    }

    deleteStream(args: SubscriptionArgs) {
        delete this.getGroup(args)[args.eventStream]
    }

    clearStreams() {
        this.streams = {}
    }

    getGroup(args: SubscriptionArgs) {
        const groupKey = this.getGroupKey(args)

        if (!this.streams[groupKey]) {
            this.streams[groupKey] = {}
        }

        return this.streams[groupKey]
    }

    getGroupKey(args: SubscriptionArgs) {
        return args.guildId || StreamRegistry.ADMIN_STREAM_GROUP
    }

    forEachStream(callback: (stream: Readable<any>) => void) {
        Object.values(this.streams).forEach(streamMap => {
            Object.values(streamMap).forEach(stream => {
                callback(stream)
            })
        })
    }
}
