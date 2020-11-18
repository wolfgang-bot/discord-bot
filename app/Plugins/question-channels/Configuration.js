class Configuration {
    constructor({ channel, helpMessage }) {
        this.channel = channel
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