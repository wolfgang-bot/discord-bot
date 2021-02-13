import { v4 as uuid } from "uuid"
import Model from "../lib/Model"

export enum EVENT_TYPES {
    GUILD_MEMBER_ADD,
    GUILD_MEMBER_REMOVE,
    MESSAGE_SEND,
    VOICECHANNEL_JOIN,
    VOICECHANNEL_LEAVE
}

export type GuildMemberAddEventMeta = {
    memberCount: number
}

export type GuildMemberRemoveEventMeta = {
    memberCount: number
}

export type VoiceChannelLeaveEventMeta = {
    duration: number
}

export type EventModelValues = {
    type: EVENT_TYPES,
    timestamp: number,
    guild_id?: string,
    meta?: object,
}

class Event extends Model implements EventModelValues {
    static context = {
        model: Event,
        table: "events"
    }
    type: EVENT_TYPES
    timestamp: number
    guild_id?: string
    meta?: object

    constructor(values: EventModelValues) {
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
}

export default Event