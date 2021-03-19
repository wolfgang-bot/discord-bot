import Discord from "discord.js"
import { Readable } from "../../../lib/Stream"
import Guild from "../../../models/Guild"
import OAuthServiceProvider, { ExtendedAPIGuild } from "../../services/OAuthServiceProvider"
import { AuthorizedSocket } from "../SocketManager"
import { SubscriptionArgs } from "../types"
import BroadcastChannel from "../../../services/BroadcastChannel"

export default class UserGuildStream extends Readable<ExtendedAPIGuild[]> {
    guilds: Record<string, ExtendedAPIGuild> = {}
    
    constructor(
        public socket: AuthorizedSocket,
        public args: SubscriptionArgs
    ) {
        super()

        this.handleGuildCreate = this.handleGuildCreate.bind(this)
        this.handleGuildDelete = this.handleGuildDelete.bind(this)
    }
    
    construct() {
        this.pushInitialValues().then(() => {
            BroadcastChannel.addListener("guild/create", this.handleGuildCreate)
            BroadcastChannel.addListener("guild/delete", this.handleGuildDelete)
        })
    }
    
    destroy() {
        BroadcastChannel.removeListener("guild/create", this.handleGuildCreate)
        BroadcastChannel.removeListener("guild/delete", this.handleGuildDelete)
    }

    collectBuffer(buffer: ExtendedAPIGuild[][]) {
        return buffer.flat()
    }

    pushGuilds() {
        const guilds = Object.values(this.guilds)
        this.sortGuildsByActiveAttribute(guilds)
        this.push(guilds)
    }

    async pushInitialValues() {
        await this.fetchGuilds()
        this.pushGuilds()
    }

    handleGuildCreate(guild: Guild) {
        if (guild.id in this.guilds && !this.guilds[guild.id].isActive) {
            this.guilds[guild.id].isActive = true
            this.pushGuilds()
        }
    }

    handleGuildDelete(guild: Guild) {
        if (guild.id in this.guilds && this.guilds[guild.id].isActive) {
            this.guilds[guild.id].isActive = false
            this.pushGuilds()
        }
    }

    async fetchGuilds() {
        const guilds = await Promise.all(
            (await OAuthServiceProvider.fetchGuilds(this.socket.user.access_token))
                .filter(this.isGuildAdmin)
                .map(this.withActiveAttribute)
        )

        guilds.forEach(guild => this.guilds[guild.id] = guild)
    }

    isGuildAdmin(guild: ExtendedAPIGuild) {
        return new Discord.Permissions(guild.permissions as string as Discord.PermissionResolvable)
            .has("ADMINISTRATOR")
    }

    async withActiveAttribute(guild: ExtendedAPIGuild) {
        const model = await Guild.findBy("id", guild.id)
        return {
            ...guild,
            isActive: !!model
        } as ExtendedAPIGuild
    }

    sortGuildsByActiveAttribute(guilds: ExtendedAPIGuild[]) {
        guilds.sort((a, b) => (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0))
    }
}
