const LocaleServiceProvider = require("../../../services/LocaleServiceProvider.js")
const ModuleServiceProvider = require("../../../services/ModuleServiceProvider.js")
const ActiveChannel = require("../models/ActiveChannel.js")
const QuestionEmbed = require("../embeds/QuestionEmbed.js")
const NotificationEmbed = require("../embeds/NotificationEmbed.js")
const Guild = require("../../../models/Guild.js")
const Module = require("../../../models/Module.js")
const ModuleInstance = require("../../../models/ModuleInstance.js")

class ChannelManager {
    constructor(context, channel) {
        this.context = context
        this.channel = channel
        this.guildConfig = null
        this.config = null

        this.activeChannels = {} // Map: channel-id -> ActiveChannel
        this.timeoutUsers = new Set()

        this.handleMessage = this.handleMessage.bind(this)
        this.handleReaction = this.handleReaction.bind(this)
    }

    async handleMessage(message) {
        if (message.author.bot || !message.guild || message.guild.id !== this.context.guild.id) {
            return
        }

        // Create a new question channel
        if (message.channel.id === this.channel.id) {
            await this.createChannel(message)
            return
        }

        const activeChannel = this.activeChannels[message.channel.id]

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

    async handleReaction(reaction, user) {
        if (
            user.bot ||
            reaction.message.guild.id !== this.context.guild.id ||
            !(reaction.message.channel.id in this.activeChannels)
        ) {
            return
        }
        
        const activeChannel = this.activeChannels[reaction.message.channel.id]
        
        if (user.id !== activeChannel.user.id) {
            return
        }
        
        if (reaction.emoji.name === this.config.resolveReaction) {
            await this.resolveChannel(activeChannel.channel, reaction, user)
        }
    }

    async resolveChannel(channel, reaction, user) {
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

    async deleteChannel(channel) {
        await channel.delete()
        delete this.activeChannels[channel.id]
        await this.storeActiveChannels()
    }

    async createChannel(message) {
        const locale = (await LocaleServiceProvider.guild(this.context.guild)).scope("question-channels")

        // Delete original message of user
        await message.delete()

        // Check if user already has an active channel
        const dm = await message.author.createDM()
        if (Object.values(this.activeChannels).some(({ user }) => user.id === message.author.id)) {
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

        const { activeChannels } = instance.data

        if (activeChannels) {
            await Promise.all(Object.entries(activeChannels).map(async ([id, { channelId, messageId, userId }]) => {
                const channel = await this.context.guild.channels.cache.get(channelId)
                const message = await channel.messages.fetch(messageId)
                const user = await this.context.client.users.fetch(userId)

                this.activeChannels[id] = new ActiveChannel({ channel, message, user })
            }))
        }
    }

    async fetchInstance() {
        const module = await Module.findBy("name", this.context.module.name)
        return await ModuleInstance.where(`module_id = '${module.id}' AND guild_id = '${this.context.guild.id}'`)
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
        await Promise.all(Object.values(this.activeChannels).map(({ channel }) => channel.delete()))

        this.context.client.removeListener("message", this.handleMessage)
        this.context.client.removeListener("messageReactionAdd", this.handleReaction)
    }
}

module.exports = ChannelManager