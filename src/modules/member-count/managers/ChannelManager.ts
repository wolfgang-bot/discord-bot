import Discord from "discord.js"
import log from "loglevel"
import Manager from "../../../lib/Manager"
import Context from "../../../lib/Context"
import Configuration from "../models/Configuration"
import ModuleInstance from "../../../models/ModuleInstance"

type InstanceData = {
    channelId?: string
}

class ChannelManager extends Manager {
    config: Configuration
    channel: Discord.VoiceChannel

    constructor(context: Context, config: Configuration) {
        super(context, config)
        this.handleGuildMembersChange = this.handleGuildMembersChange.bind(this)
    }
    
    getChannelName() {
        return this.config.channelName.replace(
            /{}/g,
            this.context.guild.memberCount.toString()
        )
    }

    async createChannel() {
        this.channel = await this.context.guild.channels.create(
            this.getChannelName(),
            {
                type: "voice",
                // https://github.com/eduardozgz/member-counter-bot/blob/dev/src/commands/setup.ts#L144
                permissionOverwrites: [
                    {
                        id: this.context.client.user.id,
                        type: "member",
                        allow: ["CONNECT", "SEND_MESSAGES"],
                        deny: 0
                    },
                    {
                        id: this.context.guild.id,
                        type: "role",
                        allow: 0,
                        deny: "CONNECT"
                    }
                ]
            }
        )
    }

    async fetchChannel() {
        const model = await ModuleInstance.findByContext(this.context)
        const data = model.data as InstanceData

        if (!data.channelId) {
            await this.createChannel()
            data.channelId = this.channel.id
            await model.update()
        } else {
            try {
                this.channel = await this.context.client.channels.fetch(
                    data.channelId
                ) as Discord.VoiceChannel
            } catch (error) {
                log.debug(error)
                delete data.channelId
                await model.update()
                return this.fetchChannel()
            }
        }
    }
    
    async handleGuildMembersChange(member: Discord.GuildMember) {
        if (member.guild.id === this.context.guild.id) {
            await this.channel.setName(this.getChannelName())
        }
    }

    async init() {
        await this.fetchChannel()
        
        this.context.client.addListener("guildMemberAdd", this.handleGuildMembersChange)
        this.context.client.addListener("guildMemberRemove", this.handleGuildMembersChange)
    }
    
    async delete() {
        await this.channel.delete()

        this.context.client.removeListener("guildMemberAdd", this.handleGuildMembersChange)
        this.context.client.removeListener("guildMemberRemove", this.handleGuildMembersChange)
    }
}

export default ChannelManager
