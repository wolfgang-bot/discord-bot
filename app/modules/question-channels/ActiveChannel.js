class ActiveChannel {
    constructor({ channel, message, user }) {
        // Channel which has been created for the question
        this.channel = channel
        // Message which contains the question
        this.message = message
        // User who asked the question
        this.user = user
    }

    toJSON() {
        return {
            channelId: this.channel.id,
            messageId: this.message.id,
            userId: this.user.id
        }
    }
}

module.exports = ActiveChannel