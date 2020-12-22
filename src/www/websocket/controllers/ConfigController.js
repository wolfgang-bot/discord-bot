const Guild = require("../../../models/Guild.js")
const defaultConfig = require("../../../config/default.js")
const { success, error } = require("../responses.js")
const { compareStructure, verifyConstraints, insertIntoDescriptiveObject } = require("../../../utils")
const { checkPermissions } = require("../../utils")

class ConfigController {
    /**
     * @param {Discord.Client} client 
     */
    constructor(client) {
        this.client = client
    }

    /**
     * Get a guild's configuration in form of a descriptive object
     * 
     * @param {Socket} socket
     * @param {String} guildId
     * @param {Function} send
     */
    async getConfigDescriptive(socket, guildId, send) {
        const guild = await Guild.findBy("id", guildId)

        if (!guild) {
            return send(error(404, "Guild not found"))
        }

        await guild.fetchDiscordGuild(this.client)

        if (!await checkPermissions(guild.discordGuild, socket.user, ["MANAGE_GUILD"])) {
            return send(error(403))
        }

        const formatted = insertIntoDescriptiveObject(guild.config, defaultConfig)

        send(success(formatted))
    }

    /**
     * Update a guild's configuration
     */
    async updateConfig(socket, guildId, newValue, send) {
        const guild = await Guild.findBy("id", guildId)

        if (!guild) {
            return send(error(404, "Guild not found"))
        }

        await guild.fetchDiscordGuild(this.client)

        if (!await checkPermissions(guild.discordGuild, socket.user, ["MANAGE_GUILD"])) {
            return send(error(403))
        }

        /**
         * Check if the given object has the same structure as the existing
         * configuration object
         */
        if (typeof newValue !== "object" || !compareStructure(guild.config, newValue)) {
            return send(error(400, "Invalid format"))
        }

        /**
         * Check if the given object matches all constraints
         */
        const errors = verifyConstraints(req.body, defaultConfig)

        if (errors) {
            return send(error(400, errors))
        }

        guild.config = newValue
        await guild.update()

        send(success())
    }
}

module.exports = ConfigController