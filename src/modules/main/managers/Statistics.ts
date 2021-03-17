import Discord from "discord.js"
import Event, {
    EVENT_TYPES,
    GuildMemberEventMeta,
    VoiceChannelLeaveEventMeta,
    EventModelValues,
    GuildEventMeta,
    UserEventMeta,
    ModuleInstanceEventMeta
} from "../../../models/Event"
import Guild from "../../../models/Guild"
import ModuleInstance from "../../../models/ModuleInstance"
import User from "../../../models/User"
import BroadcastChannel from "../../../services/BroadcastChannel"
import { PartialBy } from "../../../utils"

type VoiceChannelConnection = {
    joinedAt: number
}

export default class StatisticsManager {
    voiceChannelConnections: Record<string, VoiceChannelConnection> = {}

    private async registerEvent<TMeta = undefined>({ data, broadcastEvent }: {
        data: PartialBy<EventModelValues<TMeta>, "timestamp">,
        broadcastEvent?: string
    }) {
        const dataWithTimestamp: EventModelValues<TMeta> = {
            timestamp: Date.now(),
            ...data
        }

        const event = new Event(dataWithTimestamp)
        await event.store()
        if (broadcastEvent) {
            BroadcastChannel.emit(`statistics/${broadcastEvent}`, event)
        }
    }

    async registerGuildAddEvent(guild: Discord.Guild) {
        await this.registerEvent<GuildEventMeta>({
            data: {
                type: EVENT_TYPES.GUILD_ADD,
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

    async registerModuleInstanceStartEvent(instance: ModuleInstance) {
        await this.registerEvent<ModuleInstanceEventMeta>({
            data: {
                type: EVENT_TYPES.MODULE_INSTANCE_START,
                guild_id: instance.guild_id,
                meta: {
                    instanceCount: await ModuleInstance.getRowCount()
                }
            },
            broadcastEvent: "module-instance-start"
        })
    }

    async registerModuleInstanceStopEvent(instance: ModuleInstance) {
        await this.registerEvent<ModuleInstanceEventMeta>({
            data: {
                type: EVENT_TYPES.MODULE_INSTANCE_STOP,
                guild_id: instance.guild_id,
                meta: {
                    instanceCount: await ModuleInstance.getRowCount()
                }
            },
            broadcastEvent: "module-instance-stop"
        })
    }
}
