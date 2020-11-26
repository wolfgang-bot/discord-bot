class Configuration {
    constructor({ channel, helpMessage }) {
        // Channel in which questions are asked
        this.channel = channel
        // The help message which is sent into this.channel
        this.helpMessage = helpMessage
    }

    toJSON() {
        return {
            channelId: this.channel.id,
            helpMessageId: this.helpMessage.id
        }
    }
}

module.exports = Configuration