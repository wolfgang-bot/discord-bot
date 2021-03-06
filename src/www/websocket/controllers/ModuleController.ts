import WebSocketController from "../../../lib/WebSocketController"
import ModuleRegistry from "../../../services/ModuleRegistry"
import ModuleInstanceRegistry from "../../../services/ModuleInstanceRegistry"
import Guild from "../../../models/Guild"
import Module from "../../../models/Module"
import { error, success } from "../responses"
import { checkPermissions } from "../../../utils"
import ModuleInstance from "../../../models/ModuleInstance"

export default class ModuleController extends WebSocketController {
    /**
     * Get all modules available to the requesting user
     */
    getModules(send: Function) {
        const modules = ModuleRegistry.getPublicModules({ includeStatic: true })
        modules.forEach(module => ModuleRegistry.translate(module))

        send(success(modules))
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

        if (!this.socket.user.isAdmin(guild)) {
            return send(error(403))
        }

        const instances = ModuleInstanceRegistry.getInstancesFromGuildId(guild.id)

        send(success(instances))
    }

    /**
     * Start a module for a guild
     */
    async startInstance(guildId: string, moduleKey: string, args: Record<string, any>, send: Function) {
        if (!args || typeof args !== "object") {
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

        if (!this.socket.user.isAdmin(guild)) {
            return send(error(403))
        }

        const module = await Module.findBy("key", moduleKey) as Module

        if (!module) {
            return send(error(404, "Module not found"))
        }

        /**
         * Start instance and forward errors to client
         */
        try {
            await ModuleInstanceRegistry.guild(guild.discordGuild).startModule(this.client, module, args)
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

        return send(success())
    }

    /**
     * Stop a module from a guild
     */
    async stopInstance(guildId: string, moduleKey: string, send: Function) {
        const guild = await Guild.findBy("id", guildId) as Guild

        if (!guild) {
            return send(error(404, "Guild not found"))
        }

        /**
         * Verify permissions
         */
        await guild.fetchDiscordGuild(this.client)

        if (!this.socket.user.isAdmin(guild)) {
            return send(error(403))
        }

        const module = await Module.findBy("key", moduleKey) as Module

        if (!module) {
            return send(error(404, "Module not found"))
        }

        /**
         * Stop instance and forward errors to the client
         */
        try {
            await ModuleInstanceRegistry.guild(guild.discordGuild).stopModule(module)
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

        return send(success())
    }

    /**
     * Restart a module from a guild
     */
    async restartInstance(guildId: string, moduleKey: string, send: Function) {
        const guild = await Guild.findBy("id", guildId) as Guild

        if (!guild) {
            return send(error(404, "Guild not found"))
        }

        /**
         * Verify permissions
         */
        await guild.fetchDiscordGuild(this.client)

        if (!this.socket.user.isAdmin(guild)) {
            return send(error(403))
        }

        /**
         * Validate module parameter
         */
        const module = await Module.findBy("key", moduleKey) as Module

        if (!module) {
            return send(error(404, "Module not found"))
        }

        /**
         * Stop instance and forward errors to the client
         */
        try {
            await ModuleInstanceRegistry.guild(guild.discordGuild).restartModule(module)
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

        return send(success())
    }

    /**
     * Update a module-instance's configuration
     */
    async updateConfig(guildId: string, moduleKey: string, newConfig: object, send: Function) {
        const guild = await Guild.findBy("id", guildId) as Guild

        if (!guild) {
            return send(error(404, "Guild not found"))
        }

        /**
         * Verify permissions
         */
        await guild.fetchDiscordGuild(this.client)

        if (!checkPermissions(guild.discordGuild, this.socket.user, ["ADMINISTRATOR"])) {
            return send(error(403))
        }

        /**
         * Validate module parameter
         */
        const moduleModel = await Module.findBy("key", moduleKey) as Module

        if (!moduleModel) {
            return send(error(404, "Module not found"))
        }

        const instanceModel = await ModuleInstance.where(`
            module_id='${moduleModel.id}' AND guild_id='${guild.id}'
        `) as ModuleInstance

        if (!instanceModel) {
            return send(error(404, "Instance not found"))
        }

        if (typeof newConfig !== "object") {
            return send(error(400, "New config is not an object"))
        }

        try {
            await ModuleInstanceRegistry
                .guild(guild.discordGuild)
                .updateConfig(instanceModel, newConfig)
        } catch (err) {
            if (process.env.NODE_ENV === "development") {
                console.error(err)
            }

            if (typeof err !== "string") {
                return send(error(500))
            }

            return send(error(400, error))
        }

        send(success(newConfig))
    }
}
