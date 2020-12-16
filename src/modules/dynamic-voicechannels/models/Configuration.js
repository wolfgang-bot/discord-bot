class Configuration {
    static fromArgs(args) {
        return new Configuration({ parentChannel: args[0] })
    }

    static async fromJSON(context, object) {
        const parentChannel = await context.guild.channels.cache.get(object.parentChannelId)
        return new Configuration({ parentChannel })
    }
    
    /**
     * @param {Object} data
     * @param {Discord.CategoryChannel} data.parentChannel The category in which the module operates
     */
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