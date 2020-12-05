const Guild = require("../../models/Guild.js")
const { compareStructure, verifyConstraints, insertIntoDescriptiveObject } = require("../../utils")
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
     * Check if a guild member has all permissions
     * 
     * @param {Discord.Guild} guild 
     * @param {Discord.User} user 
     * @param {Array<String>} permissions 
     */
    static async checkPermissions(guild, user, permissions) {
        await guild.fetchDiscordGuild(ConfigController.client)
        const member = await guild.discordGuild.members.fetch(user.id)
        return member.hasPermission(permissions)
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

        if (!await ConfigController.checkPermissions(guild, req.user, ["MANAGE_GUILD"])) {
            return res.status(403).end()
        }

        res.send(guild.config)
    }

    /**
     * Get a guild's configuration as a descriptive object
     */
    static async getOneDescriptive(req, res) {
        const guild = await Guild.findBy("id", req.params.guildId)

        if (!guild) {
            return res.status(404).end()
        }

        await guild.fetchDiscordGuild(ConfigController.client)

        if (!await ConfigController.checkPermissions(guild, req.user, ["MANAGE_GUILD"])) {
            return res.status(403).end()
        }


        const result = insertIntoDescriptiveObject(guild.config, defaultConfig)

        res.send(result)
    }

    /**
     * Update a guild's configuration
     */
    static async update(req, res) {
        const guild = await Guild.findBy("id", req.params.guildId)

        if (!guild) {
            return res.status(404).end()
        }

        if (!await ConfigController.checkPermissions(guild, req.user, ["MANAGE_GUILD"])) {
            return res.status(403).end()
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