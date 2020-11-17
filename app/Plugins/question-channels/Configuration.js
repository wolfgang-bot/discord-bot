class Configuration {
    constructor({ channel }) {
        this.channel = channel
    }

    toJSON() {
        return {
            channelId: this.channel.id
        }
    }
}

module.exports = Configuration