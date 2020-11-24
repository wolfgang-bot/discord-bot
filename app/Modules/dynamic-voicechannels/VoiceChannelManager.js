const Guild = require("../../Models/Guild.js")

class VoiceChannelManager {
    constructor(client, guild, parentChannel) {
        this.client = client
        this.guild = guild
        this.parentChannel = parentChannel
        this.config = null

        this.channels = []

        this.updateVoiceChannels = this.updateVoiceChannels.bind(this)
    }

    getVoiceChannels() {
        return this.guild.channels.cache.array().filter(channel => channel.type === "voice" && channel.parent.id === this.parentChannel.id)
    }

    async createVoiceChannel(index) {
        const name = this.config.dynamicVoicechannels.channelName.replace(/{}/g, index + 1)
        const channel = await this.guild.channels.create(name, {
            type: "voice",
            parent: this.parentChannel,
            position: index
        })
        this.channels[index] = channel
    }

    async updateVoiceChannels() {
        // Delete all but one useless voicechannels
        let shouldDeleteChannels = false
        await Promise.all(this.channels.map((channel, index) => {
            if (channel.members.size === 0) {
                if (!shouldDeleteChannels) {
                    shouldDeleteChannels = true
                    return
                }

                if (index >= this.config.dynamicVoicechannels.defaultChannels) {
                    this.channels.splice(index, 1)
                    return channel.delete()
                }
            }
        }))

        // Create a new voice channel if there is at least one user in every channel,
        if (this.channels.every(channel => channel.members.size > 0)) {
            this.createVoiceChannel(this.channels.length)
        }
    }

    async init() {
        this.config = await Guild.config(this.guild)

        this.channels = this.getVoiceChannels()
        
        // Create remaining voice channels
        for (let i = this.channels.length; i < this.config.dynamicVoicechannels.defaultChannels; i++) {
            await this.createVoiceChannel(i)
        }

        this.client.on("voiceStateUpdate", this.updateVoiceChannels)
    }
    
    async delete() {
        await Promise.all(this.channels.map(channel => channel.delete()))
        
        this.client.removeListener("voiceStateUpdate", this.updateVoiceChannels)
    }
}

module.exports = VoiceChannelManager