const fs = require("fs")
const path = require("path")
const StorageFacade = require("../../Facades/StorageFacade.js")
const ModuleServiceProvider = require("../../Services/ModuleServiceProvider.js")
const ActiveChannel = require("./ActiveChannel.js")
const QuestionEmbed = require("./QuestionEmbed.js")
const Guild = require("../../Models/Guild.js")

const CONTENT_DIR = path.join(__dirname, "content")

const content = {
    tooManyQuestions: fs.readFileSync(path.join(CONTENT_DIR, "too-many-questions.md"), "utf-8")
}

const storageKey = ModuleServiceProvider.storagePrefix + "question-channels"

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
        if (!message.guild || message.guild.id !== this.guild.id) {
            return
        }

        if (message.author.id !== this.client.user.id) {
            // Create a new question channel
            if (message.channel.id === this.channel.id) {
                await this.createChannel(message)
                return
            }

            // Add reputation to author
            if (
                this.activeChannels[message.channel.id] && // Channel is one of the question channels
                message.author.id !== this.activeChannels[message.channel.id].user.id && // User is not the question channel's creator 
                !this.timeoutUsers.has(message.author.id) // User is not throttled
            ) {
                this.client.emit("reputationAdd", message.member, this.config.questionChannels.messageReputation)

                this.timeoutUsers.add(message.author.id)

                setTimeout(() => {
                    this.timeoutUsers.delete(message.author.id)
                }, this.config.questionChannels.messageReputationTimeout)
            }
        }
    }

    async handleReaction(reaction, user) {
        if (reaction.message.guild.id !== this.guild.id) {
            return
        }
        
        if (!(reaction.message.channel.id in this.activeChannels)) {
            return
        }
        
        const { channel, message, user: owner } = this.activeChannels[reaction.message.channel.id]
        
        if (user.id !== owner.id) {
            return
        }
        
        if (reaction.emoji.name === this.config.questionChannels.resolveReaction) {
            await this.resolveChannel(channel, reaction, user)
            
        } else if (reaction.message.id === message.id && reaction.emoji.name === this.config.questionChannels.deleteReaction) {
            await this.deleteChannel(channel)
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
        if (Object.values(this.activeChannels).some(({ user }) => user.id === message.author.id)) {
            const channel = await message.author.createDM()
            await channel.send(content.tooManyQuestions.replace(/{}/g, message.content))
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

        this.activeChannels[newChannel.id] = new ActiveChannel({
            channel: newChannel,
            user: message.author,
            message: question
        })

        await this.storeActiveChannels()
    }

    async storeActiveChannels() {
        const store = await StorageFacade.guild(this.guild).getItem(storageKey)
        store.activeChannels = this.activeChannels
        await StorageFacade.guild(this.guild).setItem(storageKey, store)
    }

    async loadActiveChannels() {
        const store = await StorageFacade.guild(this.guild).getItem(storageKey)

        if (!store) {
            return
        }

        const { activeChannels } = store

        if (activeChannels) {
            await Promise.all(Object.entries(activeChannels).map(async ([id, { channelId, messageId, userId }]) => {
                const channel = await this.guild.channels.cache.get(channelId)
                const message = await channel.messages.fetch(messageId)
                const user = await this.client.users.fetch(userId)

                this.activeChannels[id] = new ActiveChannel({ channel, message, user })
            }))
        }
    }
    
    async init() {
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