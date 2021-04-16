import { v4 as uuid } from "uuid"
import Model from "../lib/Model"
import Collection from "../lib/Collection"

export enum EVENT_TYPES {
    GUILD_ADD,
    GUILD_REMOVE,
    USER_ADD,
    MODULE_INSTANCE_START,
    MODULE_INSTANCE_STOP,
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

export type ModuleInstanceEventMeta = {
    instanceCount: number
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
    user_id?: string,
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
    user_id?: string
    meta?: TMeta

    static findByTypes<TEventMeta = undefined>(
        types: EVENT_TYPES[],
        { guildId, userId, limit }: {
            guildId?: string,
            userId?: string,
            limit?: number,
        } = {}
    ) {
        const typesSelector = types
            .map(type => `type = '${type}'`)
            .join(" OR ")
        
        return Event.whereAll(`
            (${typesSelector})
            ${guildId ? `AND guild_id = '${guildId}'` : ""}
            ${userId ? `AND user_id = '${userId}'` : ""}
            ORDER BY timestamp DESC
            ${limit ? `LIMIT ${limit}` : ""}
        `) as Promise<Collection<Event<TEventMeta>>>
    }

    constructor(values: EventModelValues<TMeta>) {
        super({
            table: "events",
            columns: ["id", "type", "timestamp", "guild_id", "user_id", "meta"],
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
            user_id: this.user_id,
            meta: this.meta
        }
    }
}

export default Event
