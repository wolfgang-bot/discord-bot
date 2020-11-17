const QuestionEmbed = require("./QuestionEmbed.js")
const settings = require("./settings.json")

class ChannelManager {
    constructor(client, channel) {
        this.client = client
        this.channel = channel
    }

    init() {
        this.client.on("message", this.handleMessage.bind(this))
    }

    async handleMessage(message) {
        if (message.author.id !== this.client.user.id) {
            if (message.channel.id === this.channel.id) {
                await this.createChannel(message)
            }
        }
    }

    async createChannel(message) {
        // Delete original message of user
        await message.delete()
        
        // Create new channel for user
        const channelName = settings.questionChannelName.replace(/{}/g, message.author.username)
        const channelOptions = {
            parent: this.channel.parent.id,
            reason: `Question Channels Plugin: Channel Manager (Invoked by '${message.author.username}' - '${message.author.id}')`
        }
        const newChannel = await this.channel.guild.channels.create(channelName, channelOptions)

        // Send message of user as embed into new channel
        const question = await newChannel.send(new QuestionEmbed(message))
        await question.pin()

        // Add deletion emoji to question
        await question.react(settings.questionChannelDeleteReactionName)

        // Delete channel when user reacts to question
        const reactionFilter = (reaction, user) => user.id === message.author.id && reaction.emoji.name === settings.questionChannelDeleteReactionName
        await question.awaitReactions(reactionFilter, { max: 1 })
        await newChannel.delete()
    }
}

module.exports = ChannelManager