import { Readable } from "../../../lib/Stream"
import BroadcastChannel from "../../../services/BroadcastChannel"
import Event, { GuildMemberEventMeta } from "../../../models/Event"

export default class MembersStream extends Readable<Event<GuildMemberEventMeta>> {
    constructor(public guildId: string) {
        super()

        this.guildId = guildId

        this.handleMembersEvent = this.handleMembersEvent.bind(this)
    }

    construct() {
        BroadcastChannel.on("statistics/guild-member-add", this.handleMembersEvent)
        BroadcastChannel.on("statistics/guild-member-remove", this.handleMembersEvent)
    }

    destroy() {
        BroadcastChannel.removeListener("statistics/guild-member-add", this.handleMembersEvent)
        BroadcastChannel.removeListener("statistics/guild-member-remove", this.handleMembersEvent)
    }

    handleMembersEvent(event: Event) {
        if (event.guild_id === this.guildId) {
            this.push(event)
        }
    }
}