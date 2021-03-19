export type SubscriptionArgs = {
    eventStream: EVENT_STREAMS,
    guildId?: string
}

export enum EVENT_STREAMS {
    GUILDS = "guilds",
    USERS = "users",
    MODULE_INSTANCES = "module-instances",
    GUILD_MODULE_INSTANCES = "guild-module-instances",
    MEMBERS = "members",
    MESSAGES = "messages",
    VOICE = "voice"
}

export enum AUTH_METHODS {
    GUILD_ADMIN,
    BOT_ADMIN,
}
