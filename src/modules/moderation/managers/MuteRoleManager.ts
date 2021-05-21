import Discord from "discord.js"
import log from "loglevel"
import Configuration from "../../../lib/Configuration"
import Context from "../../../lib/Context"
import Manager from "../../../lib/Manager"
import ModuleInstance from "../../../models/ModuleInstance"
import { InstanceData } from "../models/InstanceData"

const MUTE_ROLE_NAME = "🔇 Muted"

class MuteRoleManager extends Manager {
    role: Discord.Role

    constructor(context: Context, config: Configuration) {
        super(context, config)
        this.handleChannelCreate = this.handleChannelCreate.bind(this)
    }

    getRole() {
        return this.role
    }

    async fetchRole() {
        const model = await ModuleInstance.findByContext(this.context)
        const { muteRoleId } = model.data as InstanceData
        if (!muteRoleId) {
            return
        }
        try {
            this.role = await this.context.guild.roles.fetch(muteRoleId)
        } catch (error) {
            log.debug(error)
            return
        }
    }

    async createRole() {
        this.role = await this.context.guild.roles.create({
            data: {
                name: MUTE_ROLE_NAME
            }
        })
        const model = await ModuleInstance.findByContext(this.context)
        model.data.muteRoleId = this.role.id
        await model.update()
        await this.overwriteAllChannelPermissions()
    }

    async overwriteAllChannelPermissions() {
        await Promise.all(this.context.guild.channels.cache.map(channel =>
            this.overwriteChannelPermissions(channel)
        ))
    }

    async overwriteChannelPermissions(channel: Discord.GuildChannel) {
        await channel.overwritePermissions([
            {
                type: "role",
                id: this.role.id,
                deny: ["SEND_MESSAGES", "ADD_REACTIONS", "SPEAK", "STREAM"]
            }
        ])
    }

    async handleChannelCreate(channel: Discord.GuildChannel) {
        if (channel.guild.id === this.context.guild.id) {
            if (channel.type === "text" || channel.type === "voice") {
                await this.overwriteChannelPermissions(channel)
            }
        }
    }

    async init() {
        await this.fetchRole()
        if (!this.role) {
            await this.createRole()
        }
        this.context.client.addListener("channelCreate", this.handleChannelCreate)
    }
    
    async delete() {
        await this.role.delete()
        this.context.client.removeListener("channelCreate", this.handleChannelCreate)
    }
}

export default MuteRoleManager
