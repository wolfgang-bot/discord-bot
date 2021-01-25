import * as Discord from "discord.js"
import Context from "../../../lib/Context"
import Manager from "../../../lib/Manager.js"
import LocaleServiceProvider from "../../../services/LocaleServiceProvider.js"
import Guild from "../../../models/Guild.js"
import Module from "../../../models/Module.js"
import ModuleInstance from "../../../models/ModuleInstance.js"
import QuestionEmbed from "../embeds/QuestionEmbed.js"
import NotificationEmbed from "../embeds/NotificationEmbed.js"
import ActiveChannel, { ActiveChannelJSON } from "../models/ActiveChannel.js"
import Configuration from "../models/Configuration"

type InstanceData = {
    activeChannels: ActiveChannelsMap
}

type ActiveChannelsMap = {
    [channelId: string]: ActiveChannel | ActiveChannelJSON
}

class ChannelManager extends Manager {
    channel: Discord.TextChannel
    guildConfig: any
    activeChannels: ActiveChannelsMap = {}
    timeoutUsers: Set<string> = new Set
    config: Configuration

    constructor(context: Context, config: Configuration) {
        super(context)

        this.channel = config.channel

        this.handleMessage = this.handleMessage.bind(this)
        this.handleReaction = this.handleReaction.bind(this)
    }

    async handleMessage(message: Discord.Message) {
        if (message.author.bot || !message.guild || message.guild.id !== this.context.guild.id) {
            return
        }

        // Create a new question channel
        if (message.channel.id === this.channel.id) {
            await this.createChannel(message)
            return
        }

        const activeChannel = this.activeChannels[message.channel.id] as ActiveChannel

        if (activeChannel) {
            // Add reputation to author
            if (
                message.author.id !== activeChannel.user.id && // User is not the question channel's creator 
                !this.timeoutUsers.has(message.author.id) // User is not throttled
            ) {
                this.context.client.emit("reputationAdd", message.member, this.config.messageReputation)
    
                this.timeoutUsers.add(message.author.id)
    
                setTimeout(() => {
                    this.timeoutUsers.delete(message.author.id)
                }, this.config.messageReputationTimeout)
            }
    
            // Delete channel
            if (
                message.author.id === activeChannel.user.id && // User is the question channel's creator
                message.content.trim() === this.config.deleteMessage
            ) {
                await this.deleteChannel(activeChannel.channel)
            }
        }
        
    }

    async handleReaction(reaction: Discord.MessageReaction, user: Discord.User) {
        if (
            user.bot ||
            reaction.message.guild.id !== this.context.guild.id ||
            !(reaction.message.channel.id in this.activeChannels)
        ) {
            return
        }
        
        const activeChannel = this.activeChannels[reaction.message.channel.id] as ActiveChannel
        
        if (user.id !== activeChannel.user.id) {
            return
        }
        
        if (reaction.emoji.name === this.config.resolveReaction) {
            await this.resolveChannel(activeChannel.channel, reaction, user)
        }
    }

    async resolveChannel(channel: Discord.TextChannel, reaction: Discord.MessageReaction, user: Discord.User) {
        const locale = (await LocaleServiceProvider.guild(this.context.guild)).scope("question-channels")

        if (reaction.message.author.bot) {
            await reaction.remove()
            await reaction.message.channel.send(locale.translate("error_message_from_bot"))
            return
        }

        if (reaction.message.author.id === user.id) {
            await reaction.remove()
            await reaction.message.channel.send(locale.translate("error_own_message"))
            return
        }

        this.context.client.emit("reputationAdd", reaction.message.member, this.config.acceptReputation)

        await this.deleteChannel(channel)
    }

    async deleteChannel(channel: Discord.TextChannel) {
        await channel.delete()
        delete this.activeChannels[channel.id]
        await this.storeActiveChannels()
    }

    async createChannel(message: Discord.Message) {
        const locale = (await LocaleServiceProvider.guild(this.context.guild)).scope("question-channels")

        // Delete original message of user
        await message.delete()

        // Check if user already has an active channel
        const dm = await message.author.createDM()
        const channels = Object.values(this.activeChannels) as ActiveChannel[]
        if (channels.some(({ user }) => user.id === message.author.id)) {
            await dm.send(locale.translate("error_too_many_questions", message.content))
            return
        }
        
        // Create new channel for user
        const channelName = this.config.channelName.replace(/{}/g, message.author.username)
        const lines = message.content.split("\n")
        const channelOptions = {
            parent: this.channel.parent.id,
            reason: `Question Channels Module: Channel Manager (Invoked by '${message.author.username}' - '${message.author.id}')`,
            topic: lines.length > 1 ? lines[0] : ""
        }
        const newChannel = await this.channel.guild.channels.create(channelName, channelOptions)
        
        // Send message of user as embed into new channel
        const question = await newChannel.send(new QuestionEmbed(this.guildConfig, locale, message))
        await question.pin()

        // Send user a notification
        await dm.send(new NotificationEmbed(this.guildConfig, locale, this.context.guild))

        this.activeChannels[newChannel.id] = new ActiveChannel({
            channel: newChannel,
            user: message.author,
            message: question
        })

        await this.storeActiveChannels()
    }

    async storeActiveChannels() {
        const instance = await this.fetchInstance()

        instance.data.activeChannels = this.activeChannels

        await instance.update()
    }

    async loadActiveChannels() {
        const instance = await this.fetchInstance()

        const { activeChannels } = instance.data as InstanceData

        if (activeChannels) {
            const channels = Object.entries(activeChannels) as [string, ActiveChannelJSON][]
            await Promise.all(channels.map(async ([id, { channelId, messageId, userId }]) => {
                const channel = this.context.guild.channels.cache.get(channelId) as Discord.TextChannel
                const message = await channel.messages.fetch(messageId)
                const user = await this.context.client.users.fetch(userId)

                this.activeChannels[id] = new ActiveChannel({ channel, message, user })
            }))
        }
    }

    async fetchInstance() {
        const module = await Module.findBy("name", this.context.module.internalName)
        return await ModuleInstance.where(`module_id = '${module.id}' AND guild_id = '${this.context.guild.id}'`) as ModuleInstance
    }
    
    async init() {
        this.guildConfig = await Guild.config(this.context.guild)
        this.config = this.guildConfig["question-channels"]

        await this.loadActiveChannels()

        this.context.client.on("message", this.handleMessage)
        this.context.client.on("messageReactionAdd", this.handleReaction)
    }
    
    async delete() {
        // Delete all active channels
        const channels = Object.values(this.activeChannels) as ActiveChannel[]
        await Promise.all(channels.map(({ channel }) => channel.delete()))

        this.context.client.removeListener("message", this.handleMessage)
        this.context.client.removeListener("messageReactionAdd", this.handleReaction)
    }
}

export default ChannelManager