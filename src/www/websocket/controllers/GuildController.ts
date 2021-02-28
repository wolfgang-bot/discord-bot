import WebSocketController from "../../../lib/WebSocketController"
import { success, error } from "../responses"
import Guild from "../../../models/Guild"

export default class GuildController extends WebSocketController {
    /**
     * Forward request to the OAuthController.getGuilds method
     */
    async getGuilds(send: Function) {
        const guilds = Object.values(this.socket.guilds)

        guilds.sort((a, b) => (b.isActive as unknown as number) - (a.isActive as unknown as number))

        send(success(guilds))
    }

    /**
     * Get the channels (text, voice, category, ...) of a guild
     */
    async getChannels(guildId: string, send: Function) {
        const guild = await Guild.findBy("id", guildId) as Guild

        if (!guild) {
            return send(error(404))
        }

        await guild.fetchDiscordGuild(this.client)

        if (!await this.socket.user.isAdmin(guild)) {
            return send(error(403))
        }

        send(success(guild.discordGuild.channels.cache))
    }

    /**
     * Get the roles of a guild
     */
    async getRoles(guildId: string, send: Function) {
        const guild = await Guild.findBy("id", guildId) as Guild

        if (!guild) {
            return send(error(404))
        }

        await guild.fetchDiscordGuild(this.client)

        if (!await this.socket.user.isAdmin(guild)) {
            return send(error(403))
        }

        const roles = await guild.discordGuild.roles.fetch()
        send(success(roles.cache))
    }

    /**
     * Get member count of guild
     */
    async getMemberCount(guildId: string, send: Function) {
        const guild = await this.client.guilds.fetch(guildId)
        
        if (!guild || !guild.available) {
            return send(error(404))
        }

        if (!this.socket.user.isAdmin(guild)) {
            return send(error(403))
        }

        send(success(guild.memberCount))
    }
}
