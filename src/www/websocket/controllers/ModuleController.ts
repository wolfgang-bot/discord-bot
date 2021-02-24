import { WebSocketController } from "@personal-discord-bot/shared/dist"
import ModuleRegistry from "../../../services/ModuleRegistry"
import ModuleInstanceRegistry from "../../../services/ModuleInstanceRegistry"
import { Guild } from "@personal-discord-bot/shared/dist/models"
import Module from "@personal-discord-bot/shared/dist/models/Module"
import { error, success } from "../responses"
import { AuthorizedSocket } from "../SocketManager"

export default class ModuleController extends WebSocketController<AuthorizedSocket> {
    /**
     * Get all modules available to the requesting user
     */
    getModules(send: Function) {
        const modules = ModuleRegistry.modules.filter(module => !module.isPrivate && !module.isGlobal)
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
    async startInstance(guildId: string, moduleKey: string, args: string[], send: Function) {
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
        // Fetch guild
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
}
