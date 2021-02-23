import Discord from "discord.js"
import Guild from "@personal-discord-bot/shared/dist/models/Guild"
import Manager from "../../../lib/Manager"
import Context from "@personal-discord-bot/shared/dist/module/Context"
import Configuration from "../models/Configuration"

class VoiceChannelManager extends Manager {
    config: Configuration
    parentChannel: Discord.CategoryChannel
    channels: Discord.VoiceChannel[] = []

    constructor(context: Context, parentChannel: Discord.CategoryChannel) {
        super(context)

        this.parentChannel = parentChannel

        this.updateVoiceChannels = this.updateVoiceChannels.bind(this)
    }

    getVoiceChannels() {
        return this.context.guild.channels.cache
            .array()
            .filter(channel => (
                channel.type === "voice" &&
                channel.parent &&
                channel.parent.id === this.parentChannel.id
            )) as Discord.VoiceChannel[]
    }

    async createVoiceChannel(index: number) {
        const name = this.config.channelName.replace(/{}/g, (index + 1).toString())
        const channel = await this.context.guild.channels.create(name, {
            type: "voice",
            parent: this.parentChannel,
            position: index
        })
        this.channels[index] = channel
    }

    async updateVoiceChannels() {
        // Delete all but one empty voicechannels
        let shouldDeleteChannels = false
        await Promise.all(this.channels.map((channel, index) => {
            if (channel.members.size === 0) {
                if (!shouldDeleteChannels) {
                    shouldDeleteChannels = true
                    return
                }

                if (index >= this.config.defaultChannels) {
                    this.channels.splice(index, 1)
                    return channel.delete()
                }
            }
        }))

        // Create a new voice channel if there is at least one user in every channel
        if (this.channels.every(channel => channel.members.size > 0)) {
            this.createVoiceChannel(this.channels.length)
        }
    }

    async init() {
        this.config = (await Guild.config(this.context.guild))["dynamic-voicechannels"]

        this.channels = this.getVoiceChannels()
        
        // Create remaining voice channels
        for (let i = this.channels.length; i < this.config.defaultChannels; i++) {
            await this.createVoiceChannel(i)
        }

        this.context.client.on("voiceStateUpdate", this.updateVoiceChannels)
    }
    
    async delete() {
        await Promise.all(this.channels.map(channel => channel.delete()))
        
        this.context.client.removeListener("voiceStateUpdate", this.updateVoiceChannels)
    }
}

export default VoiceChannelManager
