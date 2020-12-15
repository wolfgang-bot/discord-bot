class Configuration {
    constructor({ channel, roleMessage }) {
        // Channel in which the reaction-roles message will be sent
        this.channel = channel
        // Message on which the reaction roles will be attached
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