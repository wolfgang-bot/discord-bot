import Discord from "discord.js"
import User from "../../models/User"
import { AUTH_METHODS, EVENT_STREAMS, SubscriptionArgs } from "./types"

type AuthFunction = (args: SubscriptionArgs) => Promise<number | void>

const streamAuthMethods: Record<EVENT_STREAMS, AUTH_METHODS> = {
    [EVENT_STREAMS.GUILDS]: AUTH_METHODS.BOT_ADMIN,
    [EVENT_STREAMS.GUILDS_RESOURCES]: AUTH_METHODS.BOT_ADMIN,
    [EVENT_STREAMS.USERS]: AUTH_METHODS.BOT_ADMIN,
    [EVENT_STREAMS.MODULE_INSTANCES]: AUTH_METHODS.BOT_ADMIN,
    [EVENT_STREAMS.MODULE_SHARES]: AUTH_METHODS.BOT_ADMIN,
    [EVENT_STREAMS.USER_GUILDS]: AUTH_METHODS.NO_AUTH,
    [EVENT_STREAMS.GUILD_MODULE_INSTANCES]: AUTH_METHODS.GUILD_ADMIN,
    [EVENT_STREAMS.MEMBERS]: AUTH_METHODS.GUILD_ADMIN,
    [EVENT_STREAMS.MESSAGES]: AUTH_METHODS.GUILD_ADMIN,
    [EVENT_STREAMS.VOICE]: AUTH_METHODS.GUILD_ADMIN,
    [EVENT_STREAMS.USER_MESSAGE_LEADERBOARD]: AUTH_METHODS.GUILD_ADMIN,
    [EVENT_STREAMS.USER_VOICE_LEADERBOARD]: AUTH_METHODS.GUILD_ADMIN
}

export default class StreamAuthorizer {
    authMethodsMap: Record<AUTH_METHODS, AuthFunction> = {
        [AUTH_METHODS.GUILD_ADMIN]: this.isGuildAdmin,
        [AUTH_METHODS.BOT_ADMIN]: this.isBotAdmin,
        [AUTH_METHODS.NO_AUTH]: () => Promise.resolve()
    }

    constructor(
        private client: Discord.Client,
        private user: User
    ) {}

    async authorize(args: SubscriptionArgs) {
        const authMethod = streamAuthMethods[args.eventStream]
        return await this.authMethodsMap[authMethod].call(this, args)
    }

    async isGuildAdmin(args: SubscriptionArgs) {
        const guild = await this.client.guilds.fetch(args.guildId)

        if (!guild) {
            return 404
        }

        if (!this.user.isAdmin(guild)) {
            return 403
        }
    }

    async isBotAdmin() {
        await this.user.fetchIsBotAdmin()
        if (!this.user.isBotAdmin) {
            return 403
        }
    }
}
