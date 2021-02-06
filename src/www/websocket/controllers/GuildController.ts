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
        await guild.fetchDiscordGuild(this.client)

        if (!await this.socket.user.isAdmin(guild)) {
            return send(error(403))
        }

        send(success(guild.discordGuild.channels.cache))
    }
}