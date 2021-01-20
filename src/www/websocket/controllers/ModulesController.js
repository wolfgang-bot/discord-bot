const HttpModulesController = require("../../controllers/ModulesController.js")
const ModuleServiceProvider = require("../../../services/ModuleServiceProvider.js")
const Guild = require("../../../models/Guild.js")
const Module = require("../../../models/Module.js")
const { error, success } = require("../responses.js")
const { checkPermissions } = require("../../utils")

class ModulesController {
    /**
     * @param {Discord.Client} client 
     */
    constructor(client) {
        this.client = client
    }

    /**
     * Forward request to http ModulesController.getAll
     * 
     * @param {Socket} socket
     * @param {Function} send
     */
    getModules(socket, send) {
        HttpModulesController.getAll(null, {
            send: data => send(success(data))
        })
    }

    /**
     * Get the module instances of a guild
     * 
     * @param {Socket} socket
     * @param {String} guildId
     * @param {Function} send
     */
    async getInstances(socket, guildId, send) {
        // Fetch guild
        const guild = await Guild.findBy("id", guildId)

        if (!guild) {
            return send(error(404, "Guild not found"))
        }

        /**
         * Verify user's permissions
         */
        await guild.fetchDiscordGuild(this.client)

        if (!await checkPermissions(guild.discordGuild, socket.user, ["MANAGE_GUILD"])) {
            return send(error(403))
        }

        // Get active instances
        const instances = Object.values(ModuleServiceProvider.guild(guild.discordGuild).instances)

        send(success(instances))
    }

    /**
     * Start a module for a guild
     * 
     * @param {Socket} socket
     * @param {String} guildId
     * @param {String} moduleName
     * @param {Array<String>} args
     * @param {Function} send
     */
    async startInstance(socket, guildId, moduleName, args, send) {
        if (!args || args.constructor.name !== "Array") {
            return send(error(400))
        }

        // Fetch guild
        const guild = await Guild.findBy("id", guildId)

        if (!guild) {
            return send(error(404, "Guild not found"))
        }

        /**
         * Verify permissions
         */
        await guild.fetchDiscordGuild(this.client)

        if (!await checkPermissions(guild.discordGuild, socket.user, ["MANAGE_GUILD"])) {
            return send(error(403))
        }

        // Fetch module
        const module = await Module.findBy("name", moduleName)

        if (!module) {
            return send(error(404, "Module not found"))
        }

        /**
         * Start instance and forward errors to client
         */
        try {
            await ModuleServiceProvider.guild(guild.discordGuild).startModule(this.client, module, args)
        } catch (err) {
            if (process.env.NODE_ENV === "development") {
                console.error(err)
            }

            if (typeof err !== "string") {
                return send(error(500))
            } else {
                return send(error(400, err))
            }
        }

        socket.sendModuleInstances(guildId)
    }

    /**
     * Stop a module from a guild
     * 
     * @param {Socket} socket
     * @param {String} guildId
     * @param {String} moduleName
     * @param {Function} send
     */
    async stopInstance(socket, guildId, moduleName, send) {
        // Fetch guild
        const guild = await Guild.findBy("id", guildId)

        if (!guild) {
            return send(error(404, "Guild not found"))
        }

        /**
         * Verify permissions
         */
        await guild.fetchDiscordGuild(this.client)

        if (!await checkPermissions(guild.discordGuild, socket.user, ["MANAGE_GUILD"])) {
            return send(error(403))
        }

        // Fetch module
        const module = await Module.findBy("name", moduleName)

        if (!module) {
            return send(error(404, "Module not found"))
        }

        /**
         * Stop instance and forward errors to the client
         */
        try {
            await ModuleServiceProvider.guild(guild.discordGuild).stopModule(module)
        } catch (err) {
            if (process.env.NODE_ENV === "development") {
                console.error(err)
            }

            if (typeof err !== "string") {
                return send(error(500))
            } else {
                return send(error(400, err))
            }
        }

        socket.sendModuleInstances(guildId)
    }

    /**
     * Restart a module from a guild
     *
     * @param {Socket} socket
     * @param {String} guildId
     * @param {String} moduleName
     * @param {Function} send
     */
    async restartInstance(socket, guildId, moduleName, send) {
        // Fetch guild
        const guild = await Guild.findBy("id", guildId)

        if (!guild) {
            return send(error(404, "Guild not found"))
        }

        /**
         * Verify permissions
         */
        await guild.fetchDiscordGuild(this.client)

        if (!await checkPermissions(guild.discordGuild, socket.user, ["MANAGE_GUILD"])) {
            return send(error(403))
        }

        /**
         * Validate module parameter
         */
        const module = await Module.findBy("name", moduleName)

        if (!module) {
            return send(error(404, "Module not found"))
        }

        /**
         * Stop instance and forward errors to the client
         */
        try {
            await ModuleServiceProvider.guild(guild.discordGuild).restartModule(module)
        } catch (err) {
            if (process.env.NODE_ENV === "development") {
                console.error(err)
            }

            if (typeof err !== "string") {
                return send(error(500))
            } else {
                return send(error(400, err))
            }
        }

        socket.sendModuleInstances(guildId)
    }

    /**
     * Forward request to: 'this.getInstances'
     * 
     * @param {Socket} socket 
     * @param {String} guildId 
     */
    async sendModuleInstances(socket, guildId) {
        this.getInstances(socket, guildId, (res) => {
            socket.emit("set:module-instances", {
                guildId: res.data
            })
        })
    }
}

module.exports = ModulesController