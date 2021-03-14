import { v4 as uuid } from "uuid"
import Model from "../lib/Model"

export enum EVENT_TYPES {
    GUILD_ADD,
    GUILD_REMOVE,
    USER_ADD,
    GUILD_MEMBER_ADD,
    GUILD_MEMBER_REMOVE,
    MESSAGE_SEND,
    VOICECHANNEL_LEAVE
}

export type GuildEventMeta = {
    guildCount: number
}

export type UserEventMeta = {
    userCount: number
}

export type GuildMemberEventMeta = {
    memberCount: number
}

export type VoiceChannelLeaveEventMeta = {
    duration: number
}

export type EventModelValues<TMeta> = {
    type: EVENT_TYPES,
    timestamp: number,
    guild_id?: string,
    meta?: TMeta,
}

class Event<TMeta = undefined> extends Model implements EventModelValues<TMeta> {
    static context = {
        model: Event,
        table: "events"
    }
    id: string
    type: EVENT_TYPES
    timestamp: number
    guild_id?: string
    meta?: TMeta

    constructor(values: EventModelValues<TMeta>) {
        super({
            table: "events",
            columns: ["id", "type", "timestamp", "guild_id", "meta"],
            defaultValues: {
                id: uuid
            },
            values
        })
    }

    async init() {
        if (typeof this.meta === "string") {
            this.meta = JSON.parse(this.meta)
        }
    }

    toJSON() {
        return {
            type: this.type,
            timestamp: this.timestamp,
            guild_id: this.guild_id,
            meta: this.meta
        }
    }
}

export default Event
