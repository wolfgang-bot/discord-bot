const QuestionEmbed = require("./QuestionEmbed.js")
const config = require("../../../config")

class ChannelManager {
    constructor(client, channel) {
        this.client = client
        this.channel = channel

        this.activeChannels = {} // Map: channel-id -> creator-id
        this.timeoutUsers = new Set()

        this.handleMessage = this.handleMessage.bind(this)
        this.handleReaction = this.handleReaction.bind(this)
    }

    async handleMessage(message) {
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
                this.client.emit("reputationAdd", message.member, config.questionChannels.messageReputation)

                this.timeoutUsers.add(message.author.id)

                setTimeout(() => {
                    this.timeoutUsers.delete(message.author.id)
                }, config.questionChannels.messageReputationTimeout)
            }
        }
    }

    async handleReaction(reaction, user) {
        if (!(reaction.message.channel.id in this.activeChannels)) {
            return
        }

        const { channel, message, user: owner } = this.activeChannels[reaction.message.channel.id]
        
        if (user.id !== owner.id) {
            return
        }

        if (reaction.emoji.name === config.questionChannels.resolveReaction) {
            await this.resolveChannel(channel, reaction, user)

        } else if (reaction.message.id === message.id && reaction.emoji.name === config.questionChannels.deleteReaction) {
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

        this.client.emit("reputationAdd", reaction.message.member, config.questionChannels.acceptReputation)

        await this.deleteChannel(channel)
    }

    async deleteChannel(channel) {
        await channel.delete()
        delete this.activeChannels[channel.id]
    }

    async createChannel(message) {
        // Delete original message of user
        await message.delete()
        
        // Create new channel for user
        const channelName = config.questionChannels.channelName.replace(/{}/g, message.author.username)
        const lines = message.content.split("\n")
        const channelOptions = {
            parent: this.channel.parent.id,
            reason: `Question Channels Module: Channel Manager (Invoked by '${message.author.username}' - '${message.author.id}')`,
            topic: lines.length > 1 ? lines[0] : ""
        }
        const newChannel = await this.channel.guild.channels.create(channelName, channelOptions)
        
        // Send message of user as embed into new channel
        const question = await newChannel.send(new QuestionEmbed(message))
        await question.pin()

        this.activeChannels[newChannel.id] = {
            channel: newChannel,
            user: message.author,
            message: question
        }
    }
    
    init() {
        this.client.on("message", this.handleMessage)
        this.client.on("messageReactionAdd", this.handleReaction)
    }
    
    delete() {
        this.client.removeListener("message", this.handleMessage)
        this.client.removeListener("messageReactionAdd", this.handleReaction)
    }
}

module.exports = ChannelManager