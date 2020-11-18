class Configuration {
    constructor({ parentChannel }) {
        this.parentChannel = parentChannel
    }

    toJSON() {
        return {
            parentChannelId: this.parentChannel.id
        }
    }
}

module.exports = Configuration