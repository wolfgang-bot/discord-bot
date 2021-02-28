import Discord from "discord.js"
import Event, {
    EVENT_TYPES,
    GuildMemberEventMeta,
    VoiceChannelLeaveEventMeta,
    EventModelValues
} from "../../../models/Event"
import BroadcastChannel from "../../../services/BroadcastChannel"

type VoiceChannelConnection = {
    joinedAt: number
}

export default class StatisticsManager {
    voiceChannelConnections: Record<string, VoiceChannelConnection> = {}

    private async registerEvent<TMeta = undefined>({ getData, broadcastEvent }: {
        getData: () => EventModelValues<TMeta>,
        broadcastEvent?: string
    }) {
        const event = new Event(getData())
        await event.store()
        if (broadcastEvent) {
            BroadcastChannel.emit(`statistics/${broadcastEvent}`, event)
        }
    }

    async registerGuildMemberAddEvent(guild: Discord.Guild) {
        await this.registerEvent<GuildMemberEventMeta>({
            getData: () => ({
                type: EVENT_TYPES.GUILD_MEMBER_ADD,
                timestamp: Date.now(),
                guild_id: guild.id,
                meta: {
                    memberCount: guild.memberCount
                }
            }),
            broadcastEvent: "guild-member-add"
        })
    }

    async registerGuildMemberRemoveEvent(guild: Discord.Guild) {
        await this.registerEvent<GuildMemberEventMeta>({
            getData: () => ({
                type: EVENT_TYPES.GUILD_MEMBER_REMOVE,
                timestamp: Date.now(),
                guild_id: guild.id,
                meta: {
                    memberCount: guild.memberCount
                }
            }),
            broadcastEvent: "guild-member-remove"
        })
    }

    async registerMessageSendEvent(guild: Discord.Guild) {
        await this.registerEvent({
            getData: () => ({
                type: EVENT_TYPES.MESSAGE_SEND,
                timestamp: Date.now(),
                guild_id: guild.id
            }),
            broadcastEvent: "message-send"
        })
    }

    async registerVoiceChannelLeaveEvent(voiceState: Discord.VoiceState) {
        const timestamp = Date.now()

        await this.registerEvent<VoiceChannelLeaveEventMeta>({
            getData: () => ({
                type: EVENT_TYPES.VOICECHANNEL_LEAVE,
                timestamp,
                guild_id: voiceState.guild.id,
                meta: {
                    duration: timestamp - this.voiceChannelConnections[voiceState.sessionID].joinedAt
                }
            }),
            broadcastEvent: "guild-channel-leave"
        })

        delete this.voiceChannelConnections[voiceState.sessionID]
    }
}