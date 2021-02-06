import Discord from "discord.js"
import WebSocketController from "../../../lib/WebSocketController"
import OAuthServiceProvider from "../../services/OAuthServiceProvider"
import { success, error } from "../responses"
import Guild from "../../../models/Guild"

export default class GuildController extends WebSocketController {
    /**
     * Forward request to the OAuthController.getGuilds method
     */
    async getGuilds(send: Function) {
        const guilds = await OAuthServiceProvider.fetchGuilds(this.socket.user.access_token)

        // Filter manageable guilds
        const filtered = guilds.filter(guild => {
            return new Discord.Permissions(guild.permissions as string as Discord.PermissionResolvable).has("MANAGE_GUILD")
        })

        // Filter existing guilds
        await Promise.all(filtered.map(async guild => {
            const model = await Guild.findBy("id", guild.id)
            guild.isActive = !!model
        }))

        filtered.sort((a, b) => (b.isActive as unknown as number) - (a.isActive as unknown as number))

        send(success(filtered))
    }

    /**
     * Get the channels (text, voice, category, ...) of a guild
     */
    async getChannels(guildId: string, send: Function) {
        const guild = await Guild.findBy("id", guildId) as Guild
        await guild.fetchDiscordGuild(this.client)

        if (!await this.socket.user.isAdmin(guild)) {
            return send(error(403))
        }

        send(success(guild.discordGuild.channels.cache))
    }
}