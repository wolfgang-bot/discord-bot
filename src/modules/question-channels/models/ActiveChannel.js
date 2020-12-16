class ActiveChannel {
    /**
     * @param {Object} data
     * @param {Discord.TextChannel} data.channel The channel which has been created for the question
     * @param {Discord.Message} data.message The message which contains the question
     * @param {Discord.User} data.user The user who asked the question
     */
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