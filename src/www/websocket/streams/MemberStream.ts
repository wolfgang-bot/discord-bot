import Discord from "discord.js"
import { Readable } from "../../../lib/Stream"
import BroadcastChannel from "../../../services/BroadcastChannel"
import Event, { EVENT_TYPES, GuildMemberEventMeta } from "../../../models/Event"
import { OHLCDataset, SVDataset } from "../../../lib/datasets"
import { AuthorizedSocket } from "../SocketManager"
import { SubscriptionArgs } from "../types"

type Dataset = [
    OHLCDataset<Event<GuildMemberEventMeta>>,
    SVDataset<Event<GuildMemberEventMeta>>
]

export default class MembersStream extends Readable<Dataset> {
    events: Event<GuildMemberEventMeta>[]
    
    constructor(
        public client: Discord.Client,
        public socket: AuthorizedSocket,
        public args: SubscriptionArgs
    ) {
        super({ useMonoBuffer: true })

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

    collectBuffer(buffer: Dataset) {
        return buffer
    }

    createDataset(events: Event<GuildMemberEventMeta>[]) {
        return [
            new OHLCDataset(
                events,
                (event) => event.meta.memberCount
            ),
            new SVDataset(
                events,
                null,
                (event) => event.type === EVENT_TYPES.GUILD_MEMBER_ADD
            )
        ] as Dataset
    }

    pushDataset() {
        this.push(this.createDataset(this.events))
    }

    async pushInitialValues() {
        const events = await Event.findByTypes([
            EVENT_TYPES.GUILD_MEMBER_ADD,
            EVENT_TYPES.GUILD_MEMBER_REMOVE
        ], {
            guildId: this.args.guildId
        })

        events.reverse()

        this.events = events
        this.pushDataset()
    }

    handleMembersEvent(event: Event) {
        if (event.guild_id === this.args.guildId) {
            this.events.push(event)
            this.pushDataset()
        }
    }
}
