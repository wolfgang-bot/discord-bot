import { Readable } from "../../../lib/Stream"
import Collection from "@personal-discord-bot/shared/dist/orm/Collection"
import BroadcastChannel from "../../../services/BroadcastChannel"
import Event, { EVENT_TYPES, GuildMemberEventMeta } from "../../../models/Event"
import config from "../../config"

export default class MembersStream extends Readable<Event<GuildMemberEventMeta>[]> {
    constructor(public guildId: string) {
        super()

        this.handleMembersEvent = this.handleMembersEvent.bind(this)
    }

    construct() {
        this.pushInitialValues().then(() => {
            BroadcastChannel.on("statistics/guild-member-add", this.handleMembersEvent)
            BroadcastChannel.on("statistics/guild-member-remove", this.handleMembersEvent)
        })
    }

    destroy() {
        BroadcastChannel.removeListener("statistics/guild-member-add", this.handleMembersEvent)
        BroadcastChannel.removeListener("statistics/guild-member-remove", this.handleMembersEvent)
    }

    collectBuffer(buffer: Event<GuildMemberEventMeta>[][]) {
        return buffer.flat()
    }

    async pushInitialValues() {
        const events = await Event.whereAll(`
            (
                type = '${EVENT_TYPES.GUILD_MEMBER_ADD}' OR 
                type = '${EVENT_TYPES.GUILD_MEMBER_REMOVE}'
            ) AND guild_id = '${this.guildId}'
            ORDER BY timestamp DESC
            LIMIT ${config.stream.maxInitialValues}
        `) as Collection<Event<GuildMemberEventMeta>>

        events.reverse()

        this.push(events)
    }

    handleMembersEvent(event: Event) {
        if (event.guild_id === this.guildId) {
            this.push([event])
        }
    }
}
