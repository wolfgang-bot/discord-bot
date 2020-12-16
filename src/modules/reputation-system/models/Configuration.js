class Configuration {
    static fromArgs(args) {
        return new Configuration({ channel: args[0] })
    }

    static async fromJSON(context, object) {
        const channel = await context.guild.channels.cache.get(object.channelId)
        return new Configuration({ channel })
    }

    /**
     * @param {Object} data
     * @param {Discord.TextChannel} data.channel The channel in which notifications (e.g. level ups) will be sent
     */
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