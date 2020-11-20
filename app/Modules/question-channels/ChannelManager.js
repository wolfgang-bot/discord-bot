const QuestionEmbed = require("./QuestionEmbed.js")
const config = require("../../../config")

class ChannelManager {
    constructor(client, channel) {
        this.client = client
        this.channel = channel

        this.activeChannels = {} // Map: channel-id -> creator-id
        this.timeoutUsers = new Set()

        this.handleMessage = this.handleMessage.bind(this)
    }

    init() {
        this.client.on("message", this.handleMessage)
    }

    delete() {
        this.client.removeListener("message", this.handleMessage)
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
                message.author.id !== this.activeChannels[message.channel.id] && // User is not the question channel's creator 
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
        this.activeChannels[newChannel.id] = message.author.id

        // Send message of user as embed into new channel
        const question = await newChannel.send(new QuestionEmbed(message))
        await question.pin()

        // Delete channel when user reacts to an answer
        const handleReaction = async (reaction, user) => {
            if (
                reaction.message.channel.id === newChannel.id && 
                reaction.emoji.name === config.questionChannels.resolveReactionName
            ) {
                if (user.id !== message.author.id) {
                    await reaction.remove()
                    await reaction.message.channel.send("Du bist nicht berechtigt eine Antwort zu akzeptieren")
                    return
                }

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

                await newChannel.delete()
                delete this.activeChannels[newChannel.id]
                this.client.removeListener("messageReactionAdd", handleReaction)
            }
        }

        this.client.on("messageReactionAdd", handleReaction)
    }
}

module.exports = ChannelManager