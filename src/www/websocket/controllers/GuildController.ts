import WebSocketController from "../../../lib/WebSocketController"
import { success, error } from "../responses"
import Guild from "@personal-discord-bot/shared/dist/models/Guild"
import LocaleProvider from "@personal-discord-bot/shared/dist/LocaleProvider"

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
     * Get the locale of a guild
     */
    async getLocale(guildId: string, send: Function) {
        const guild = await Guild.findBy("id", guildId) as Guild
        
        if (!guild) {
            return send(error(404))
        }

        send(success(guild.locale))
    }

    /**
     * Set locale for a guild
     */
    async setLocale(guildId: string, newLocale: string, send: Function) {
        const guild = await Guild.findBy("id", guildId) as Guild

        if (!guild) {
            return send(error(404))
        }

        await guild.fetchDiscordGuild(this.client)

        if (!this.socket.user.isAdmin(guild)) {
            return send(error(403))
        }

        const availableLocales = LocaleProvider.getLocaleKeys()

        if (!availableLocales.includes(newLocale)) {
            return send(error(404))
        }

        guild.locale = newLocale
        await guild.update()

        send(success())
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
