class Configuration {
    static fromArgs(args) {
        return new Configuration({ channel: args[0] })
    }

    static async fromJSON(context, object) {
        const channel = await context.guild.channels.cache.get(object.channelId)
        const roleMessage = await channel.messages.fetch(object.roleMessageId)
        return new Configuration({ channel, roleMessage })
    }

    /**
     * @param {Object} data
     * @param {Discord.TextChannel} data.channel The channel in which the reaction-roles message will be sent
     * @param {Discord.Message} data.roleMessage The message on which the reaction-roles got attached
     */
    constructor({ channel, roleMessage }) {
        this.channel = channel
        this.roleMessage = roleMessage
    }

    toJSON() {
        return {
            channelId: this.channel.id,
            roleMessageId: this.roleMessage.id
        }
    }
}

module.exports = Configuration