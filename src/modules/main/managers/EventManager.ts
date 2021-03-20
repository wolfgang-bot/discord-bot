import Discord from "discord.js"
import log from "loglevel"
import Manager from "../../../lib/Manager"
import CommandRegistry from "../../../services/CommandRegistry"
import Guild, { GUILD_STATUS } from "../../../models/Guild"
import User from "../../../models/User"
import Member from "../../../models/Member"
import StatisticsManager from "./Statistics"
import { parseArguments } from "../../../utils"
import ModuleInstance from "../../../models/ModuleInstance"
import SettingsConfig from "../../settings/models/Configuration"
import BroadcastChannel from "../../../services/BroadcastChannel"
import GuildSetup from "./GuildSetup"

class EventManager extends Manager {
    statistics: StatisticsManager = new StatisticsManager()

    async handleMessage(message: Discord.Message) {
        if (!message.author.bot) {
            const settings = await ModuleInstance.config(message.guild, "settings") as SettingsConfig
            
            if (
                message.content.startsWith(settings.commandPrefix) &&
                message.content.trim().length > settings.commandPrefix.length
            ) {
                try {
                    const args = parseArguments(
                        message.content.substring(settings.commandPrefix.length)
                    )
                    await CommandRegistry.guild(message.guild).run(message, args)
                } catch (error) {
                    log.debug(error)
                    await message.channel.send(typeof error === "string" ? error : "Internal Server Error")
                }
            } else {
                await this.statistics.registerMessageSendEvent(message.guild)
            }
        }
    }

    async handleGuildCreate(guild: Discord.Guild) {
        const setup = new GuildSetup(this.context.client, guild)

        setup.on("user/create", () => {
            this.statistics.registerUserAddEvent(guild)
        })

        await setup.run()
        await this.statistics.registerGuildAddEvent(guild)
    }

    async handleGuildDelete(guild: Discord.Guild) {
        const model = await Guild.findBy("id", guild.id) as Guild
        model.status = GUILD_STATUS.INACTIVE
        BroadcastChannel.emit("guild/delete", model)
        
        if (model) {
            await model.delete()
        }
        
        CommandRegistry.unregisterGuild(guild)

        await this.statistics.registerGuildRemoveEvent(guild)
    }

    async handleGuildMemberAdd(member: Discord.GuildMember) {
        if (member.user.bot) {
            return
        }

        // Create user if not exists
        let user = await User.findBy("id", member.user.id)
        if (!user) {
            user = new User({ id: member.user.id })
            await Promise.all([
                user.store(),
                this.statistics.registerUserAddEvent(member.guild)
            ])
        }
        
        // Create member for user
        const model = new Member({
            user_id: member.user.id,
            guild_id: member.guild.id
        })
        await Promise.all([
            model.store(),
            this.statistics.registerGuildMemberAddEvent(member.guild)
        ])
    }

    async handleGuildMemberRemove(member: Discord.GuildMember) {
        if (member.user.bot) {
            return
        }

        // Delete member from database
        const model = await Member.where(`user_id = '${member.user.id}' AND guild_id = '${member.guild.id}'`) as Member
        if (model) {
            await model.delete()
        }

        await this.statistics.registerGuildMemberRemoveEvent(member.guild)
    }

    async handleVoiceStateUpdate(oldState: Discord.VoiceState, newState: Discord.VoiceState) {
        // User stayed in the same voicechannel
        if (oldState.channelID === newState.channelID) {
            return
        }

        // User joined the voicechannel
        if (!oldState.channelID && newState.channelID) {
            await this.statistics.registerVoiceChannelJoinEvent(newState)
        }

        // User left the voicechannel (not by moving into another channel)
        if (oldState.channelID && !newState.channelID) {
            await this.statistics.registerVoiceChannelLeaveEvent(newState)
        }
    }

    async handleModuleInstanceStart(instance: ModuleInstance) {
        await this.statistics.registerModuleInstanceStartEvent(instance)
    }

    async handleModuleInstanceStop(instance: ModuleInstance) {
        await this.statistics.registerModuleInstanceStopEvent(instance)
    }

    async init() {
        const { client } = this.context
        client.on("message", this.handleMessage.bind(this))
        client.on("guildCreate", this.handleGuildCreate.bind(this))
        client.on("guildDelete", this.handleGuildDelete.bind(this))
        client.on("guildMemberAdd", this.handleGuildMemberAdd.bind(this))
        client.on("guildMemberRemove", this.handleGuildMemberRemove.bind(this))
        client.on("voiceStateUpdate", this.handleVoiceStateUpdate.bind(this))

        BroadcastChannel.on("module-instance/start", this.handleModuleInstanceStart.bind(this))
        BroadcastChannel.on("module-instance/stop", this.handleModuleInstanceStop.bind(this))
    }

    async delete() {
        // The main module will never be stopped --> nothing to do here
    }
}

export default EventManager
