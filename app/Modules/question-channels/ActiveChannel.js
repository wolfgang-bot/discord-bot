class ActiveChannel {
    constructor({ channel, message, user }) {
        this.channel = channel
        this.message = message
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