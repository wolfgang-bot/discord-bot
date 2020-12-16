class Configuration {
    static fromArgs(args) {
        return new Configuration({ channel: args[0], helpMessage: args[1] })
    }

    static async fromJSON(context, object) {
        const channel = await context.guild.channels.cache.get(object.channelId)
        const helpMessage = await channel.messages.fetch(object.helpMessageId)
        return new Configuration({ channel, helpMessage })
    }

    /**
     * @param {Object} data
     * @param {Discord.Channel} data.channel The channel in which questions can be asked
     * @param {Discord.Message} data.helpMessage The help message which got sent into the channel
     */
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