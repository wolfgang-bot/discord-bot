import Discord from "discord.js"
import Event, {
    EVENT_TYPES,
    GuildMemberEventMeta,
    VoiceChannelLeaveEventMeta,
    EventModelValues,
    GuildEventMeta,
    UserEventMeta
} from "../../../models/Event"
import Guild from "../../../models/Guild"
import User from "../../../models/User"
import BroadcastChannel from "../../../services/BroadcastChannel"

type VoiceChannelConnection = {
    joinedAt: number
}

export default class StatisticsManager {
    voiceChannelConnections: Record<string, VoiceChannelConnection> = {}

    private async registerEvent<TMeta = undefined>({ data, broadcastEvent }: {
        data: EventModelValues<TMeta>,
        broadcastEvent?: string
    }) {
        const event = new Event(data)
        await event.store()
        if (broadcastEvent) {
            BroadcastChannel.emit(`statistics/${broadcastEvent}`, event)
        }
    }

    async registerGuildAddEvent(guild: Discord.Guild) {
        await this.registerEvent<GuildEventMeta>({
            data: {
                type: EVENT_TYPES.GUILD_ADD,
                timestamp: Date.now(),
                guild_id: guild.id,
                meta: {
                    guildCount: await Guild.getRowCount()
                }
            },
            broadcastEvent: "guild-add"
        })
    }

    async registerGuildRemoveEvent(guild: Discord.Guild) {
        await this.registerEvent<GuildEventMeta>({
            data: {
                type: EVENT_TYPES.GUILD_REMOVE,
                timestamp: Date.now(),
                guild_id: guild.id,
                meta: {
                    guildCount: await Guild.getRowCount()
                }
            },
            broadcastEvent: "guild-remove"
        })
    }

    async registerUserAddEvent(guild: Discord.Guild) {
        await this.registerEvent<UserEventMeta>({
            data: {
                type: EVENT_TYPES.USER_ADD,
                timestamp: Date.now(),
                guild_id: guild.id,
                meta: {
                    userCount: await User.getRowCount()
                }
            },
            broadcastEvent: "user-add"
        })
    }

    async registerGuildMemberAddEvent(guild: Discord.Guild) {
        await this.registerEvent<GuildMemberEventMeta>({
            data: {
                type: EVENT_TYPES.GUILD_MEMBER_ADD,
                timestamp: Date.now(),
                guild_id: guild.id,
                meta: {
                    memberCount: guild.memberCount
                }
            },
            broadcastEvent: "guild-member-add"
        })
    }

    async registerGuildMemberRemoveEvent(guild: Discord.Guild) {
        await this.registerEvent<GuildMemberEventMeta>({
            data: {
                type: EVENT_TYPES.GUILD_MEMBER_REMOVE,
                timestamp: Date.now(),
                guild_id: guild.id,
                meta: {
                    memberCount: guild.memberCount
                }
            },
            broadcastEvent: "guild-member-remove"
        })
    }

    async registerMessageSendEvent(guild: Discord.Guild) {
        await this.registerEvent({
            data: {
                type: EVENT_TYPES.MESSAGE_SEND,
                timestamp: Date.now(),
                guild_id: guild.id
            },
            broadcastEvent: "message-send"
        })
    }

    async registerVoiceChannelJoinEvent(voiceState: Discord.VoiceState) {
        this.voiceChannelConnections[voiceState.sessionID] = {
            joinedAt: Date.now()
        }
    }

    async registerVoiceChannelLeaveEvent(voiceState: Discord.VoiceState) {
        const timestamp = Date.now()

        await this.registerEvent<VoiceChannelLeaveEventMeta>({
            data: {
                type: EVENT_TYPES.VOICECHANNEL_LEAVE,
                timestamp,
                guild_id: voiceState.guild.id,
                meta: {
                    duration: timestamp - this.voiceChannelConnections[voiceState.sessionID].joinedAt
                }
            },
            broadcastEvent: "guild-channel-leave"
        })

        delete this.voiceChannelConnections[voiceState.sessionID]
    }
}
