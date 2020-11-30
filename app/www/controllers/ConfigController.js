const Guild = require("../../models/Guild.js")
const { compareStructure, verifyConstraints } = require("../../utils")
const defaultConfig = require("../../config/default.js")

class ConfigController {
    /**
     * Discord bot client instance
     */
    static client = null

    static setDiscordClient(client) {
        ConfigController.client = client
    }
    
    /**
     * Get a guild's configuration object
     */
    static async getOne(req, res) {
        const guild = await Guild.findBy("id", req.params.guildId)

        if (!guild) {
            return res.status(404).end()
        }

        await guild.fetchDiscordGuild(ConfigController.client)

        res.send(guild.config)
    }

    /**
     * Update a guild's configuration
     */
    static async update(req, res) {
        const guild = await Guild.findBy("id", req.params.guildId)

        if (!guild) {
            return res.status(404).end()
        }

        /**
         * Check if the given object has the same structure as the existing
         * configuration object
         */
        if (!compareStructure(guild.config, req.body)) {
            return res.status(400).end()
        }

        /**
         * Check if the given object matches all constraints
         */
        const errors = verifyConstraints(req.body, defaultConfig)
        
        if (errors) {
            return res.status(400).send(errors)
        }

        guild.config = req.body
        await guild.update()

        res.status(200).send()
    }
}

module.exports = ConfigController