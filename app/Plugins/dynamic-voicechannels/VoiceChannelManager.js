const settings = require("./settings.json")

class VoiceChannelManager {
    constructor(client, parentChannel) {
        this.client = client
        this.parentChannel = parentChannel
        this.channels = []

        this.updateVoiceChannels = this.updateVoiceChannels.bind(this)
    }

    getVoiceChannels() {
        return this.client.channels.cache.array().filter(channel => channel.type === "voice" && channel.parent.id === this.parentChannel.id)
    }

    async createVoiceChannel(index) {
        const name = settings.voiceChannelName.replace(/{}/g, index + 1)
        const channel = await this.parentChannel.guild.channels.create(name, {
            type: "voice",
            parent: this.parentChannel
        })
        this.channels[index] = channel
    }

    async updateVoiceChannels() {
        // Create a new voice channel if there is at least one user in every channel
        const shouldCreateChannel = this.channels.every(channel => channel.members.size > 0)

        if (!shouldCreateChannel) {
            this.createVoiceChannel(this.channels.length)
        }
    }

    async init() {
        this.channels = this.getVoiceChannels()
        
        // Create remaining voice channels
        for (let i = this.channels.length; i < settings.amountDefaultVoiceChannels; i++) {
            await this.createVoiceChannel(i)
        }

        this.client.on("voiceStateUpdate", this.updateVoiceChannels)
    }

    async delete() {
        await Promise.all(this.channels.map(channel => channel.delete()))
    }
}

module.exports = VoiceChannelManager