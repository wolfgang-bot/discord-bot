import Discord from "discord.js"
import { Readable } from "../../../lib/Stream"
import Event, { EVENT_TYPES } from "../../../models/Event"
import User from "../../../models/User"
import BroadcastChannel from "../../../services/BroadcastChannel"
import { AuthorizedSocket } from "../SocketManager"
import { SubscriptionArgs } from "../types"

class LeaderboardDataset {
    users: [User, number][]
    size: number = 10

    constructor(public client: Discord.Client, public guildId: string) {}

    async fetchLeaderboard() {
        const users = Object.entries(
            await Event.sumMetaValuePerUser({
                type: EVENT_TYPES.VOICECHANNEL_LEAVE,
                metaKey: "duration",
                guildId: this.guildId
            })
        )

        users.sort((a, b) => b[1] - a[1])

        this.users = await Promise.all(
            users.slice(0, this.size).map(async ([userId, score]) => {
                const user = await User.findBy("id", userId) as User
                user.discordUser = await this.client.users.fetch(userId)
                return [user, score] as [User, number]
            })
        )
    }

    toJSON() {
        return this.users
    }
}

export default class UserVoiceLeaderboardStream extends Readable<LeaderboardDataset> {    
    constructor(
        public client: Discord.Client,
        public socket: AuthorizedSocket,
        public args: SubscriptionArgs
    ) {
        super({ useMonoBuffer: true })

        this.handleMessageEvent = this.handleMessageEvent.bind(this)
    }

    construct() {
        this.pushDataset().then(() => {
            BroadcastChannel.on("statistics/voice-channel-leave", this.handleMessageEvent)
        })
    }

    destroy() {
        BroadcastChannel.removeListener("statistics/voice-channel-leave", this.handleMessageEvent)
    }

    collectBuffer(buffer: LeaderboardDataset) {
        return buffer
    }

    async createDataset() {
        const dataset = new LeaderboardDataset(this.client, this.args.guildId)
        await dataset.fetchLeaderboard()
        return dataset
    }

    async pushDataset() {
        this.push(await this.createDataset())
    }

    handleMessageEvent(event: Event) {
        if (event.guild_id === this.args.guildId) {
            this.pushDataset()
        }
    }
}
