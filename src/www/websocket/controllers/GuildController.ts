import { Response } from "express"
import Discord from "discord.js"
import WebSocketController from "../../../lib/WebSocketController"
import HttpOAuthController from "../../controllers/OAuthController"
import { success, error } from "../responses"
import { InternalRequest } from "../../server"
import Guild from "../../../models/Guild"

export default class GuildController extends WebSocketController {
    /**
     * Forward request to the OAuthController.getGuilds method
     */
    async getGuilds(send: Function) {
        HttpOAuthController.getGuilds(this.socket as unknown as InternalRequest, {
            send: data => send(success(data))
        } as Response)
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