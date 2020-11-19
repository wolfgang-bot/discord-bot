const QuestionEmbed = require("./QuestionEmbed.js")
const config = require("../../../config")

class ChannelManager {
    constructor(client, channel) {
        this.client = client
        this.channel = channel

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
            this.client.emit("reputationAdd", message.member, 10)

            if (message.channel.id === this.channel.id) {
                await this.createChannel(message)
            }
        }
    }

    async createChannel(message) {
        // Delete original message of user
        await message.delete()
        
        // Create new channel for user
        const channelName = config.questionChannels.channelName.replace(/{}/g, message.author.username)
        const channelOptions = {
            parent: this.channel.parent.id,
            reason: `Question Channels Module: Channel Manager (Invoked by '${message.author.username}' - '${message.author.id}')`
        }
        const newChannel = await this.channel.guild.channels.create(channelName, channelOptions)

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

                this.client.emit("reputationAdd", user, config.questionChannels.acceptReputation)

                await newChannel.delete()
                this.client.removeListener("messageReactionAdd", handleReaction)
            }
        }

        this.client.on("messageReactionAdd", handleReaction)
    }
}

module.exports = ChannelManager