import Discord from "discord.js"
import Event, { EVENT_TYPES, GuildMemberAddEventMeta, GuildMemberRemoveEventMeta, VoiceChannelLeaveEventMeta } from "../../../models/Event"

type VoiceChannelConnection = {
    joinedAt: number
}

export default class StatisticsManager {
    voiceChannelConnections: Record<string, VoiceChannelConnection> = {}

    async registerGuildMemberAddEvent(guild: Discord.Guild) {
        const meta: GuildMemberAddEventMeta = {
            memberCount: guild.memberCount
        }
        await new Event({
            type: EVENT_TYPES.GUILD_MEMBER_ADD,
            timestamp: Date.now(),
            guild_id: guild.id,
            meta
        }).store()
    }

    async registerGuildMemberRemoveEvent(guild: Discord.Guild) {
        const meta: GuildMemberRemoveEventMeta = {
            memberCount: guild.memberCount
        }
        await new Event({
            type: EVENT_TYPES.GUILD_MEMBER_REMOVE,
            timestamp: Date.now(),
            guild_id: guild.id,
            meta
        }).store()
    }

    async registerMessageSendEvent(guild: Discord.Guild) {
        await new Event({
            type: EVENT_TYPES.MESSAGE_SEND,
            timestamp: Date.now(),
            guild_id: guild.id
        }).store()
    }

    async registerVoiceChannelJoinEvent(voiceState: Discord.VoiceState) {
        const timestamp = Date.now()

        this.voiceChannelConnections[voiceState.sessionID] = {
            joinedAt: timestamp
        }

        await new Event({
            type: EVENT_TYPES.VOICECHANNEL_JOIN,
            timestamp,
            guild_id: voiceState.guild.id
        }).store()
    }

    async registerVoiceChannelLeaveEvent(voiceState: Discord.VoiceState) {
        const timestamp = Date.now()

        const meta: VoiceChannelLeaveEventMeta = {
            duration: timestamp - this.voiceChannelConnections[voiceState.sessionID].joinedAt
        }

        await new Event({
            type: EVENT_TYPES.VOICECHANNEL_LEAVE,
            timestamp,
            guild_id: voiceState.guild.id,
            meta
        }).store()
    }
}