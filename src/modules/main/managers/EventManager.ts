import Discord from "discord.js"
import log from "loglevel"
import Manager from "../../../lib/Manager"
import CommandRegistry from "../../../services/CommandRegistry"
import Guild from "../../../models/Guild"
import User from "../../../models/Guild"
import Member from "../../../models/Member"
import StatisticsManager from "./Statistics"
import RootCommandGroup from "../commands"
import ModuleInstanceRegistry from "../../../services/ModuleInstanceRegistry"
import { parseArguments } from "../../../utils"
import SetupEmbed from "../embeds/SetupEmbed"
import ModuleInstance from "../../../models/ModuleInstance"
import SettingsConfig from "../../settings/models/Configuration"

function isTextChannel(channel: Discord.GuildChannel): channel is Discord.TextChannel {
    return channel.type === "text"
}

async function getFirstTextChannel(client: Discord.Client, guild: Discord.Guild) {
    for (let [_, channel] of guild.channels.cache) {
        if (!isTextChannel(channel)) {
            continue
        }

        const permissions = channel.permissionsFor(client.user)
        if (!permissions.has("SEND_MESSAGES")) {
            continue
        }

        return channel
    }
}

async function withLoadingIndicator(channel: Discord.TextChannel, callback: () => Promise<void> | void) {
    const message = await channel.send(new SetupEmbed(0))
    await callback()
    await message.edit(new SetupEmbed(1))
}

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
        const initGuild = async () => {
            const model = new Guild({ id: guild.id })
            await model.store()

            CommandRegistry.registerGroupForGuild(guild, new RootCommandGroup())
            await ModuleInstanceRegistry.guild(guild).startStaticModules(this.context.client)

            await guild.members.fetch()

            // Store all members / users of the guild in the database
            await Promise.all(guild.members.cache.map(async member => {
                if (member.user.bot) {
                    return
                }

                let user = await User.findBy("id", member.user.id) as User

                if (!user) {
                    user = new User({ id: member.user.id })
                    await user.store()
                }

                const model = new Member({
                    user_id: user.id,
                    guild_id: guild.id
                })
                await model.store()
            }))
        }

        const channel = await getFirstTextChannel(this.context.client, guild)

        if (channel) {
            await withLoadingIndicator(channel, initGuild)
        } else {
            await initGuild()
        }

        await this.statistics.registerGuildAddEvent(guild)
    }

    async handleGuildDelete(guild: Discord.Guild) {
        const model = await Guild.findBy("id", guild.id)
        
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
            await user.store()
        }
        
        // Create member for user
        const model = new Member({
            user_id: member.user.id,
            guild_id: member.guild.id
        })
        await model.store()

        await this.statistics.registerGuildMemberAddEvent(member.guild)
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

        // Delete user from database if he doesn't belong to any member
        const members = await Member.findAllBy("user_id", member.user.id)
        if (members.length === 0) {
            await model.fetchUser()
            await model.user.delete()
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

    async init() {
        const { client } = this.context
        client.on("message", this.handleMessage.bind(this))
        client.on("guildCreate", this.handleGuildCreate.bind(this))
        client.on("guildDelete", this.handleGuildDelete.bind(this))
        client.on("guildMemberAdd", this.handleGuildMemberAdd.bind(this))
        client.on("guildMemberRemove", this.handleGuildMemberRemove.bind(this))
        client.on("voiceStateUpdate", this.handleVoiceStateUpdate.bind(this))
    }

    async delete() {
        // The main module will never be stopped --> nothing to do here
    }
}

export default EventManager
