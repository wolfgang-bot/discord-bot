import Guild from "@personal-discord-bot/shared/dist/models/Guild"
import defaultConfig from "../../../config/default"
import { success, error } from "../responses"
import { compareStructure } from "@personal-discord-bot/shared/dist/utils"
import WebSocketController from "../../../lib/WebSocketController"

export default class ConfigController extends WebSocketController {
    /**
     * Get a guild's configuration in form of a descriptive object
     */
    async getConfigDescriptive(guildId: string, send: Function) {
        const guild = await Guild.findBy("id", guildId) as Guild

        if (!guild) {
            return send(error(404, "Guild not found"))
        }

        await guild.fetchDiscordGuild(this.client)

        if (!this.socket.user.isAdmin(guild)) {
            return send(error(403))
        }

        const formatted = defaultConfig.assignVanillaObject(guild.config)

        send(success(formatted))
    }

    /**
     * Update a guild's configuration
     */
    async updateConfig(guildId: string, newValue: object, send: Function) {
        const guild = await Guild.findBy("id", guildId) as Guild

        if (!guild) {
            return send(error(404, "Guild not found"))
        }

        await guild.fetchDiscordGuild(this.client)

        if (!this.socket.user.isAdmin(guild)) {
            return send(error(403))
        }

        /**
         * Check if the given object has the same structure as the existing
         * configuration object
         */
        if (newValue.constructor.name !== "Object" || !compareStructure(guild.config, newValue)) {
            return send(error(400, "Invalid format"))
        }

        /**
         * Check if the given object matches all constraints
         */
        const errors = defaultConfig.assignVanillaObject(newValue).runConstraints()

        if (errors) {
            return send(error(400, errors))
        }

        guild.config = newValue
        await guild.update()

        send(success(
            defaultConfig.assignVanillaObject(guild.config)
        ))
    }
}
