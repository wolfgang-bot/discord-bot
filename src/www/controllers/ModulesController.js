const ModuleServiceProvider = require("../../services/ModuleServiceProvider.js")
const Guild = require("../../models/Guild.js")
const Module = require("../../models/Module.js")
const { checkPermissions } = require("../utils")

class ModulesController {
    /**
     * Discord bot client instance
     */
    static client

    static setDiscordClient(client) {
        ModulesController.client = client
    }

    /**
     * Get all modules which are available to every guild
     */
    static getAll(req, res) {
        const modules = ModuleServiceProvider.modules.filter(module => !module.isPrivate && !module.isGlobal)

        modules.forEach(module => {
            ModuleServiceProvider.insertTranslations(module)
        })

        res.send(modules)
    }

    /**
     * Get the modules instantiated for a guild
     */
    static async getInstances(req, res) {
        /**
         * Validate guild parameter
         */
        const guild = await Guild.findBy("id", req.params.guildId)

        if (!guild) {
            return res.status(404).end()
        }

        /**
         * Verify user permissions
         */
        await guild.fetchDiscordGuild(ModulesController.client)

        if (!await checkPermissions(guild.discordGuild, req.user, ["MANAGE_GUILD"])) {
            return res.status(403).end()
        }

        // Get active instances' module names
        const instances = ModuleServiceProvider.guild(guild.discordGuild).instances
        const modules = Object.values(instances).map(instance => instance.context.module.name)

        res.send(modules)
    }

    /**
     * Start a module for a guild
     */
    static async start(req, res) {
        /**
         * Validate body
         */
        if (!req.body.args || req.body.args.constructor.name !== "Array") {
            return res.status(400).end()
        }

        /**
         * Validate guild parameter
         */
        const guild = await Guild.findBy("id", req.params.guildId)

        if (!guild) {
            return res.status(404).end("Guild not found")
        }

        /**
         * Verify permissions
         */
        await guild.fetchDiscordGuild(ModulesController.client)

        if (!await checkPermissions(guild.discordGuild, req.user, ["MANAGE_GUILD"])) {
            return res.status(403).end()
        }

        /**
         * Validate module parameter
         */
        const module = await Module.findBy("name", req.params.moduleName)

        if (!module) {
            return res.status(404).end("Module not found")
        }

        /**
         * Start instance and forward errors to client
         */
        try {
            await ModuleServiceProvider.guild(guild.discordGuild).startModule(ModulesController.client, module, req.body.args) 
        } catch(error) {
            if (process.env.NODE_ENV === "development") {
                console.error(error)
            }

            if (typeof error !== "string") {
                return res.status(500).end()
            } else {
                return res.status(400).end(error)
            }
        }

        res.status(200).end()
    }
    
    /**
     * Stop a module from a guild
     */
    static async stop(req, res) {
        /**
         * Validate guild parameter
         */
        const guild = await Guild.findBy("id", req.params.guildId)

        if (!guild) {
            return res.status(404).end("Guild not found")
        }

        /**
         * Verify permissions
         */
        await guild.fetchDiscordGuild(ModulesController.client)

        if (!await checkPermissions(guild.discordGuild, req.user, ["MANAGE_GUILD"])) {
            return res.status(403).end()
        }

        /**
         * Validate module parameter
         */
        const module = await Module.findBy("name", req.params.moduleName)

        if (!module) {
            return res.status(404).end("Module not found")
        }

        /**
         * Stop instance and forward errors to the client
         */
        try {
            await ModuleServiceProvider.guild(guild.discordGuild).stopModule(module)
        } catch (error) {
            if (process.env.NODE_ENV === "development") {
                console.error(error)
            }

            if (typeof error !== "string") {
                return res.status(500).end()
            } else {
                return res.status(400).end(error)
            }
        }

        res.status(200).end()
    }
    
    /**
     * Restart a module from a guild
     */
    static async restart(req, res) {
        /**
         * Validate guild parameter
         */
        const guild = await Guild.findBy("id", req.params.guildId)

        if (!guild) {
            return res.status(404).end("Guild not found")
        }

        /**
         * Verify permissions
         */
        await guild.fetchDiscordGuild(ModulesController.client)

        if (!await checkPermissions(guild.discordGuild, req.user, ["MANAGE_GUILD"])) {
            return res.status(403).end()
        }

        /**
         * Validate module parameter
         */
        const module = await Module.findBy("name", req.params.moduleName)

        if (!module) {
            return res.status(404).end("Module not found")
        }

        /**
         * Stop instance and forward errors to the client
         */
        try {
            await ModuleServiceProvider.guild(guild.discordGuild).restartModule(module)
        } catch (error) {
            if (process.env.NODE_ENV === "development") {
                console.error(error)
            }

            if (typeof error !== "string") {
                return res.status(500).end()
            } else {
                return res.status(400).end(error)
            }
        }

        res.status(200).end()
    }
}

module.exports = ModulesController