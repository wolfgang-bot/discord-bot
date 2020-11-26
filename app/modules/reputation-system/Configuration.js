class Configuration {
    constructor({ channel }) {
        // Notification channel
        this.channel = channel
    }

    toJSON() {
        return {
            channelId: this.channel.id
        }
    }
}

module.exports = Configuration