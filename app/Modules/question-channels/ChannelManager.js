const fs = require("fs")
const path = require("path")
const ActiveChannel = require("./ActiveChannel.js")
const QuestionEmbed = require("./QuestionEmbed.js")
const NotificationEmbed = require("./NotificationEmbed.js")
const Guild = require("../../models/Guild.js")
const Module = require("../../models/Module.js")
const ModuleInstance = require("../../models/ModuleInstance.js")

const CONTENT_DIR = path.join(__dirname, "content")

const content = {
    tooManyQuestions: fs.readFileSync(path.join(CONTENT_DIR, "too-many-questions.md"), "utf-8")
}

class ChannelManager {
    constructor(client, guild, channel) {
        this.client = client
        this.guild = guild
        this.channel = channel
        this.config = null

        this.activeChannels = {} // Map: channel-id -> ActiveChannel
        this.timeoutUsers = new Set()

        this.handleMessage = this.handleMessage.bind(this)
        this.handleReaction = this.handleReaction.bind(this)
    }

    async handleMessage(message) {
        if (message.author.bot || !message.guild || message.guild.id !== this.guild.id) {
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
                this.client.emit("reputationAdd", message.member, this.config.questionChannels.messageReputation)
    
                this.timeoutUsers.add(message.author.id)
    
                setTimeout(() => {
                    this.timeoutUsers.delete(message.author.id)
                }, this.config.questionChannels.messageReputationTimeout)
            }
    
            // Delete channel
            if (
                message.author.id === activeChannel.user.id && // User is the question channel's creator
                message.content.trim() === this.config.questionChannels.deleteReaction
            ) {
                await this.deleteChannel(activeChannel.channel)
            }
        }
        
    }

    async handleReaction(reaction, user) {
        if (
            user.bot ||
            reaction.message.guild.id !== this.guild.id ||
            !(reaction.message.channel.id in this.activeChannels)
        ) {
            return
        }
        
        const activeChannel = this.activeChannels[reaction.message.channel.id]
        
        if (user.id !== activeChannel.user.id) {
            return
        }
        
        if (reaction.emoji.name === this.config.questionChannels.resolveReaction) {
            await this.resolveChannel(activeChannel.channel, reaction, user)
        }
    }

    async resolveChannel(channel, reaction, user) {
        if (reaction.message.author.bot) {
            await reaction.remove()
            await reaction.message.channel.send("Du kannst nicht die Nachricht eines Bots als Antwort akzeptieren")
            return
        }

        if (reaction.message.author.id === user.id) {
            await reaction.remove()
            await reaction.message.channel.send("Du kannst nicht deine eigene Antwort akzeptieren")
            return
        }

        this.client.emit("reputationAdd", reaction.message.member, this.config.questionChannels.acceptReputation)

        await this.deleteChannel(channel)
    }

    async deleteChannel(channel) {
        await channel.delete()
        delete this.activeChannels[channel.id]
        await this.storeActiveChannels()
    }

    async createChannel(message) {
        // Delete original message of user
        await message.delete()

        // Check if user already has an active channel
        const dm = await message.author.createDM()
        if (Object.values(this.activeChannels).some(({ user }) => user.id === message.author.id)) {
            await dm.send(content.tooManyQuestions.replace(/{}/g, message.content))
            return
        }
        
        // Create new channel for user
        const channelName = this.config.questionChannels.channelName.replace(/{}/g, message.author.username)
        const lines = message.content.split("\n")
        const channelOptions = {
            parent: this.channel.parent.id,
            reason: `Question Channels Module: Channel Manager (Invoked by '${message.author.username}' - '${message.author.id}')`,
            topic: lines.length > 1 ? lines[0] : ""
        }
        const newChannel = await this.channel.guild.channels.create(channelName, channelOptions)
        
        // Send message of user as embed into new channel
        const question = await newChannel.send(new QuestionEmbed(this.config, message))
        await question.pin()

        // Send user a notification
        await dm.send(new NotificationEmbed(this.config, this.guild))

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
                const channel = await this.guild.channels.cache.get(channelId)
                const message = await channel.messages.fetch(messageId)
                const user = await this.client.users.fetch(userId)

                this.activeChannels[id] = new ActiveChannel({ channel, message, user })
            }))
        }
    }

    async fetchInstance() {
        return await ModuleInstance.where(`module_id = '${this.module.id}' AND guild_id = '${this.guild.id}'`)
    }
    
    async init() {
        this.module = await Module.findBy("name", "question-channels")
        this.config = await Guild.config(this.guild)

        await this.loadActiveChannels()

        this.client.on("message", this.handleMessage)
        this.client.on("messageReactionAdd", this.handleReaction)
    }
    
    async delete() {
        // Delete all active channels
        await Promise.all(Object.values(this.activeChannels).map(({ channel }) => channel.delete()))

        this.client.removeListener("message", this.handleMessage)
        this.client.removeListener("messageReactionAdd", this.handleReaction)
    }
}

module.exports = ChannelManager