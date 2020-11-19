class Configuration {
    constructor({ guild, channel }) {
        this.guild = guild
        this.channel = channel
    }

    toJSON() {
        return {
            guildId: this.guild.id,
            channelId: this.channel.id
        }
    }
}

module.exports = Configuration