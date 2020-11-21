class Configuration {
    constructor({ parentChannel }) {
        // The category in which the module operates
        this.parentChannel = parentChannel
    }

    toJSON() {
        return {
            parentChannelId: this.parentChannel.id
        }
    }
}

module.exports = Configuration