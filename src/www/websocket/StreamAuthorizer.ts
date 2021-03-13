import Discord from "discord.js"
import User from "../../models/User"
import { isBotAdmin } from "../../utils"
import { EVENT_STREAMS, SubscriptionArgs } from "./StreamManager"

export enum AUTH_METHODS {
    GUILD_ADMIN,
    BOT_ADMIN,
}

type AuthFunction = (args: SubscriptionArgs) => Promise<number | void>

const streamAuthMethods: Record<EVENT_STREAMS, AUTH_METHODS> = {
    [EVENT_STREAMS.MODULE_INSTANCES]: AUTH_METHODS.GUILD_ADMIN,
    [EVENT_STREAMS.MEMBERS]: AUTH_METHODS.GUILD_ADMIN,
    [EVENT_STREAMS.MESSAGES]: AUTH_METHODS.GUILD_ADMIN,
    [EVENT_STREAMS.VOICE]: AUTH_METHODS.GUILD_ADMIN
}

export default class StreamAuthorizer {
    authMethodsMap: Record<AUTH_METHODS, AuthFunction> = {
        [AUTH_METHODS.GUILD_ADMIN]: this.authorizeGuildAdmin.bind(this),
        [AUTH_METHODS.BOT_ADMIN]: this.authorizeBotAdmin.bind(this)
    }

    constructor(
        private client: Discord.Client,
        private user: User
    ) {}

    async authorize(args: SubscriptionArgs) {
        const authMethod = streamAuthMethods[args.eventStream]
        return await this.authMethodsMap[authMethod](args)
    }

    async authorizeGuildAdmin(args: SubscriptionArgs) {
        const guild = await this.client.guilds.fetch(args.guildId)

        if (!guild) {
            return 404
        }

        if (!this.user.isAdmin(guild)) {
            return 403
        }
    }

    async authorizeBotAdmin() {
        if (!isBotAdmin(this.user.id)) {
            return 403
        }
    }
}
