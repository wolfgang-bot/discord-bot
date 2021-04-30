import Discord from "discord.js"
import Collection from "../../../lib/Collection"
import { Readable } from "../../../lib/Stream"
import Event, { GuildEventMeta } from "../../../models/Event"
import Guild from "../../../models/Guild"
import BroadcastChannel from "../../../services/BroadcastChannel"

export default class GuildResourceStream extends Readable<Collection<Guild>> {
    guilds: Collection<Guild>

    constructor(public client: Discord.Client) {
        super({ useMonoBuffer: true })

        this.handleGuildAddEvent = this.handleGuildAddEvent.bind(this)
        this.handleGuildRemoveEvent = this.handleGuildRemoveEvent.bind(this)
    }

    construct() {
        this.pushInitialValues().then(() => {
            BroadcastChannel.on("statistics/guild-add", this.handleGuildAddEvent)
            BroadcastChannel.on("statistics/guild-remove", this.handleGuildRemoveEvent)
        })
    }
    
    destroy() {
        BroadcastChannel.removeListener("statistics/guild-add", this.handleGuildAddEvent)
        BroadcastChannel.removeListener("statistics/guild-remove", this.handleGuildRemoveEvent)
    }

    collectBuffer(buffer: Collection<Guild>) {
        return buffer
    }

    async pushInitialValues() {
        this.guilds = await Guild.getAll() as Collection<Guild>
        await this.guilds.mapAsync(guild => guild.fetchDiscordGuild(this.client))
        this.push(this.guilds)
    }

    async handleGuildAddEvent(event: Event<GuildEventMeta>) {
        const guild = await Guild.findBy("id", event.guild_id) as Guild
        await guild.fetchDiscordGuild(this.client)
        this.guilds.push(guild)
        this.push(this.guilds)
    }

    async handleGuildRemoveEvent(event: Event<GuildEventMeta>) {
        const index = this.guilds.findIndex(guild => guild.id === event.guild_id)
        this.guilds.splice(index, 1)
        this.push(this.guilds)
    }
}
