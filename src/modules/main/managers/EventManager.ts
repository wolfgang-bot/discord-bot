import Discord from "discord.js"
import Manager from "../../../lib/Manager"
import CommandRegistry from "../../../services/CommandRegistry"
import Guild from "../../../models/Guild"
import User from "../../../models/Guild"
import Member from "../../../models/Member"
import StatisticsManager from "./Statistics"
import RootCommandGroup from "../commands"
import ModuleInstanceRegistry from "../../../services/ModuleInstanceRegistry"
import { parseArguments } from "../../../utils"
import LocaleProvider from "../../../services/LocaleProvider"
import SetupEmbed from "../embeds/SetupEmbed"

function getFirstTextChannel(guild: Discord.Guild) {
    return guild.channels.cache.find(channel => channel.type === "text") as Discord.TextChannel
}

async function withLoadingIndicator(channel: Discord.TextChannel, callback: () => Promise<void> | void) {
    const locale = await LocaleProvider.guild(channel.guild)
    const config = await Guild.config(channel.guild)
    
    const message = await channel.send(new SetupEmbed(config, locale, 0))
    await callback()
    await message.edit(new SetupEmbed(config, locale, 1))
}

class EventManager extends Manager {
    statistics: StatisticsManager = new StatisticsManager()

    async handleMessage(message: Discord.Message) {
        if (!message.author.bot) {
            const config = await Guild.config(message.guild)
            
            if (message.content.startsWith(config.settings.commandPrefix)) {
                try {
                    const args = parseArguments(
                        message.content.substring(config.settings.commandPrefix.length)
                    )
                    await CommandRegistry.guild(message.guild).run(message, args)
                } catch (error) {
                    if (process.env.NODE_ENV === "development") {
                        console.error(error)
                    }

                    await message.channel.send(typeof error === "string" ? error : "Internal Server Error")
                }
            } else {
                await this.statistics.registerMessageSendEvent(message.guild)
            }
        }
    }

    async handleGuildCreate(guild: Discord.Guild) {
        await withLoadingIndicator(getFirstTextChannel(guild), async () => {
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

                let user = await User.findBy("id", member.user.id)

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
        })
    }

    async handleGuildDelete(guild: Discord.Guild) {
        const model = await Guild.findBy("id", guild.id)

        if (model) {
            await model.delete()
        }

        CommandRegistry.unregisterGuild(guild)
    }

    async handleGuildMemberAdd(member: Discord.GuildMember) {
        if (member.user.bot) {
            return
        }

        // Fetch the "User" role
        const config = await Guild.config(member.guild)
        const roles = await member.guild.roles.fetch()
        const userRole = roles.cache.find(role => role.name === config.settings.userRole)

        // Assign the user role to the new user
        if (!userRole) {
            console.error(`The role '${config.settings.userRole}' does not exist`)
        } else {
            await member.roles.add(userRole)
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

        // User left the voicechannel (not by moving into another channel)
        if (!newState.channelID) {
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
