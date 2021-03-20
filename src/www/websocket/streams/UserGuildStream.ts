import Discord from "discord.js"
import { Readable } from "../../../lib/Stream"
import Guild, { GUILD_STATUS } from "../../../models/Guild"
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

        this.handleGuildEvent = this.handleGuildEvent.bind(this)
    }
    
    construct() {
        this.pushInitialValues().then(() => {
            BroadcastChannel.addListener("guild/create", this.handleGuildEvent)
            BroadcastChannel.addListener("guild/update", this.handleGuildEvent)
            BroadcastChannel.addListener("guild/delete", this.handleGuildEvent)
        })
    }
    
    destroy() {
        BroadcastChannel.removeListener("guild/create", this.handleGuildEvent)
        BroadcastChannel.removeListener("guild/update", this.handleGuildEvent)
        BroadcastChannel.removeListener("guild/delete", this.handleGuildEvent)
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

    handleGuildEvent(guild: Guild) {
        if (guild.id in this.guilds) {
            this.guilds[guild.id].status = guild.status
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
        const model = await Guild.findBy("id", guild.id) as Guild
        return {
            ...guild,
            status: model ? model.status : GUILD_STATUS.INACTIVE
        } as ExtendedAPIGuild
    }

    sortGuildsByActiveAttribute(guilds: ExtendedAPIGuild[]) {
        const getPosition = (guild: ExtendedAPIGuild) => (
            guild.status === GUILD_STATUS.INACTIVE ? 0 : 1
        )

        guilds.sort((a, b) => getPosition(b) - getPosition(a))
    }
}
