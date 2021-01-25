import WebSocketController from "../../../lib/WebSocketController"
import HttpModulesController from "../../controllers/ModulesController"
import ModuleServiceProvider from "../../../services/ModuleServiceProvider"
import Guild from "../../../models/Guild"
import Module from "../../../models/Module"
import { error, success } from "../responses"
import { checkPermissions } from "../../utils"

export default class ModulesController extends WebSocketController {
    /**
     * Forward request to http ModulesController.getAll
     */
    getModules(send: Function) {
        HttpModulesController.getAll(null, {
            send: data => send(success(data))
        })
    }

    /**
     * Get the module instances of a guild
     */
    async getInstances(guildId: string, send: Function) {
        const guild = await Guild.findBy("id", guildId) as Guild

        if (!guild) {
            return send(error(404, "Guild not found"))
        }

        /**
         * Verify user's permissions
         */
        await guild.fetchDiscordGuild(this.client)

        if (!await checkPermissions(guild.discordGuild, this.socket.user, ["MANAGE_GUILD"])) {
            return send(error(403))
        }

        const instances = Object.values(ModuleServiceProvider.guild(guild.discordGuild).instances)

        send(success(instances))
    }

    /**
     * Start a module for a guild
     */
    async startInstance(guildId: string, moduleName: string, args: string[], send: Function) {
        if (!args || args.constructor.name !== "Array") {
            return send(error(400))
        }

        const guild = await Guild.findBy("id", guildId) as Guild

        if (!guild) {
            return send(error(404, "Guild not found"))
        }

        /**
         * Verify permissions
         */
        await guild.fetchDiscordGuild(this.client)

        if (!await checkPermissions(guild.discordGuild, this.socket.user, ["MANAGE_GUILD"])) {
            return send(error(403))
        }

        const module = await Module.findBy("name", moduleName) as Module

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

        this.socket.sendModuleInstances(guildId)
    }

    /**
     * Stop a module from a guild
     */
    async stopInstance(guildId: string, moduleName: string, send: Function) {
        // Fetch guild
        const guild = await Guild.findBy("id", guildId) as Guild

        if (!guild) {
            return send(error(404, "Guild not found"))
        }

        /**
         * Verify permissions
         */
        await guild.fetchDiscordGuild(this.client)

        if (!await checkPermissions(guild.discordGuild, this.socket.user, ["MANAGE_GUILD"])) {
            return send(error(403))
        }

        const module = await Module.findBy("name", moduleName) as Module

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

        this.socket.sendModuleInstances(guildId)
    }

    /**
     * Restart a module from a guild
     */
    async restartInstance(guildId: string, moduleName: string, send: Function) {
        const guild = await Guild.findBy("id", guildId) as Guild

        if (!guild) {
            return send(error(404, "Guild not found"))
        }

        /**
         * Verify permissions
         */
        await guild.fetchDiscordGuild(this.client)

        if (!await checkPermissions(guild.discordGuild, this.socket.user, ["MANAGE_GUILD"])) {
            return send(error(403))
        }

        /**
         * Validate module parameter
         */
        const module = await Module.findBy("name", moduleName) as Module

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

        this.socket.sendModuleInstances(guildId)
    }

    /**
     * Forward request to: 'this.getInstances'
     */
    async sendModuleInstances(guildId: string) {
        this.getInstances(guildId, (res) => {
            this.socket.emit("set:module-instances", {
                guildId: res.data
            })
        })
    }
}