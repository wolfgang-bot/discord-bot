export type SubscriptionArgs = {
    eventStream: EVENT_STREAMS,
    guildId?: string
}

export enum EVENT_STREAMS {
    GUILDS = "guilds",
    GUILDS_RESOURCES = "guilds-resources",
    USERS = "users",
    MODULE_INSTANCES = "module-instances",
    MODULE_SHARES = "module-shares",
    USER_GUILDS = "user-guilds",
    GUILD_MODULES = "guild-modules",
    GUILD_MODULE_INSTANCES = "guild-module-instances",
    MEMBERS = "members",
    MESSAGES = "messages",
    VOICE = "voice",
    USER_MESSAGE_LEADERBOARD = "user-message-leaderboard",
    USER_VOICE_LEADERBOARD = "user-voice-leaderboard"
}

export enum AUTH_METHODS {
    GUILD_ADMIN,
    BOT_ADMIN,
    NO_AUTH
}
