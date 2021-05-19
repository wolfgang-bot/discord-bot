import Discord from "discord.js"
import log from "loglevel"
import Manager from "../../../lib/Manager"
import Context from "../../../lib/Context"
import Configuration from "../models/Configuration"
import ModuleInstance from "../../../models/ModuleInstance"

type InstanceData = {
    channelIds?: string[]
}

class VoiceChannelManager extends Manager {
    config: Configuration
    channels: Discord.VoiceChannel[] = []

    constructor(context: Context, config: Configuration) {
        super(context, config)

        this.updateVoiceChannels = this.updateVoiceChannels.bind(this)
    }

    async createVoiceChannel(index: number) {
        const name = this.config.channelName.replace(/{}/g, (index + 1).toString())
        const channel = await this.context.guild.channels.create(name, {
            type: "voice",
            parent: this.config.parentChannel,
            position: index
        })
        this.channels[index] = channel
        await this.storeVoiceChannels()
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

    async storeVoiceChannels() {
        const model = await ModuleInstance.findByContext(this.context)
        model.data.channelIds = this.channels.map(channel => channel.id)
        await model.update()
    }

    async loadVoiceChannels() {
        const model = await ModuleInstance.findByContext(this.context)
        const { channelIds } = model.data as InstanceData
        if (channelIds) {
            await Promise.all(channelIds.map(async (id, index) => {
                this.channels[index] =
                    await this.context.client.channels.fetch(id) as Discord.VoiceChannel
            }))
        }
    }

    async init() {
        await this.loadVoiceChannels()

        // Create remaining voice channels
        for (let i = this.channels.length; i < this.config.defaultChannels; i++) {
            await this.createVoiceChannel(i)
        }

        this.context.client.on("voiceStateUpdate", this.updateVoiceChannels)
    }
    
    async delete() {
        await Promise.all(this.channels.map(async channel => {
            try {
                await channel.delete()
            } catch (error) {
                log.debug(error)
            }
        }))
        
        this.context.client.removeListener("voiceStateUpdate", this.updateVoiceChannels)
    }
}

export default VoiceChannelManager
