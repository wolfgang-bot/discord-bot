import Discord, { DiscordAPIError } from "discord.js"
import log from "loglevel"
import WebSocketController from "../../../lib/WebSocketController"
import ModuleRegistry from "../../../services/ModuleRegistry"
import ModuleInstanceRegistry from "../../../services/ModuleInstanceRegistry"
import Guild from "../../../models/Guild"
import Module from "../../../models/Module"
import { error, success } from "../responses"
import ModuleInstance from "../../../models/ModuleInstance"
import {
    GuildAdminValidator,
    GuildAvailableValidator,
    GuildExistsValidator,
    ModuleExistsValidator,
    ModuleInstanceExistsValidator,
    ValidationPipeline,
    ValidationError
} from "../../../lib/Validation"
import { AuthorizedSocket } from "../SocketManager"
import { ValidationError as ConfigValidationError } from "../../../lib/Configuration"

export default class ModuleController extends WebSocketController {
    guildValidationPipeline: ValidationPipeline
    moduleValidationPipeline: ValidationPipeline
    instanceValidationPipeline: ValidationPipeline

    constructor(client: Discord.Client, socket: AuthorizedSocket) {
        super(client, socket)

        this.guildValidationPipeline = new ValidationPipeline(client, [
            new GuildExistsValidator(error(404, "Guild not found")),
            new GuildAvailableValidator(error(404, "Guild not found")),
            new GuildAdminValidator(error(403))
        ])

        this.moduleValidationPipeline = this.guildValidationPipeline.extend([
            new ModuleExistsValidator(error(404, "Module not found"))
        ])

        this.instanceValidationPipeline = this.moduleValidationPipeline.extend([
            new ModuleInstanceExistsValidator(error(404, "Instance not found"))
        ])

        const makeGuildArgs = ({ guildId }) => ({
            guildId,
            user: this.socket.user
        })

        const makeModuleArgs = ({ guildId, moduleKey }) => ({
            ...makeGuildArgs({ guildId }),
            moduleKey
        })
        
        this.getInstances = this.guildValidationPipeline.bind(this.getInstances.bind(this), makeGuildArgs)

        this.validateArguments = this.moduleValidationPipeline.bind(this.validateArguments.bind(this), makeModuleArgs)
        this.startInstance = this.moduleValidationPipeline.bind(this.startInstance.bind(this), makeModuleArgs)
        this.stopInstance = this.moduleValidationPipeline.bind(this.stopInstance.bind(this), makeModuleArgs)
        this.restartInstance = this.moduleValidationPipeline.bind(this.restartInstance.bind(this), makeModuleArgs)

        this.updateConfig = this.instanceValidationPipeline.bind(this.updateConfig.bind(this), makeModuleArgs)
    }

    /**
     * Decide whether to forward an error to the client or to send an error "500"
     */
    private sendError(send: Function, err: any) {
        if (typeof err === "string" || err instanceof ConfigValidationError) {
            send(error(400, err))
        } else if (err instanceof DiscordAPIError) {
            send(error(409, err.message))
        } else {
            send(error(500))
        }
    } 

    /**
     * Get all modules available to the requesting user
     */
    getModules(_arg: object, send: Function) {
        const modules = ModuleRegistry.getPublicModules({ includeStatic: true })
        send(success(modules))
    }

    /**
     * Get the module instances of a guild
     */
    async getInstances(validationError: ValidationError, { guildId }: {
        guildId: string
    }, send: Function) {
        if (validationError) {
            send(validationError)
            return
        }

        const instances = ModuleInstanceRegistry.getInstancesFromGuildId(guildId)
        send(success(instances))
    }

    /**
     * Validate a module's configuration arguments
     */
    async validateArguments(
        validationError: ValidationError,
        { guildId, moduleKey, args }: {
            moduleKey: string,
            guildId: string,
            args: Record<string, any>
        },
        send: Function) {
        if (validationError) {
            send(validationError)
            return
        }

        if (!args || typeof args !== "object") {
            return send(error(400))
        }

        const model = await Module.findBy("key", moduleKey) as Module
        const module = ModuleRegistry.getModule(model)
        
        const guild = await Guild.findBy("id", guildId) as Guild
        await guild.fetchDiscordGuild(this.client)

        const config = await ModuleInstanceRegistry
            .guild(guild.discordGuild)
            .resolveArgumentsToConfig(module, args)

        try {
            module.config.validate(config)
        } catch (err) {
            log.debug(err)
            this.sendError(send, err)
        }

        return send(success())
    }

    /**
     * Start a module for a guild
     */
    async startInstance(
        validationError: ValidationError,
        { guildId, moduleKey, args }: {
            guildId: string,
            moduleKey: string,
            args: Record<string, any>
        },
        send: Function
    ) {
        if (validationError) {
            send(validationError)
            return
        }

        if (!args || typeof args !== "object") {
            return send(error(400))
        }

        const guild = await Guild.findBy("id", guildId) as Guild
        await guild.fetchDiscordGuild(this.client)
        
        const module = await Module.findBy("key", moduleKey) as Module

        try {
            await ModuleInstanceRegistry.guild(guild.discordGuild).startModule(this.client, module, args)
        } catch (err) {
            log.debug(err)
            return this.sendError(send, err)
        }

        return send(success())
    }

    /**
     * Stop a module from a guild
     */
    async stopInstance(
        validationError: ValidationError,
        { guildId, moduleKey }:
        {
            guildId: string,
            moduleKey: string
        },
        send: Function
    ) {
        if (validationError) {
            send(validationError)
            return
        }

        const guild = await Guild.findBy("id", guildId) as Guild
        await guild.fetchDiscordGuild(this.client)

        const module = await Module.findBy("key", moduleKey) as Module

        try {
            // await ModuleInstanceRegistry.guild(guild.discordGuild).stopModule(module)
        } catch (err) {
            log.debug(err)
            return this.sendError(send, err)
        }

        return send(success())
    }

    /**
     * Restart a module from a guild
     */
    async restartInstance(
        validationError: ValidationError,
        { guildId, moduleKey }: {
            guildId: string,
            moduleKey: string
        },
        send: Function
    ) {
        if (validationError) {
            send(validationError)
            return
        }

        const guild = await Guild.findBy("id", guildId) as Guild
        await guild.fetchDiscordGuild(this.client)

        const module = await Module.findBy("key", moduleKey) as Module

        try {
            // await ModuleInstanceRegistry.guild(guild.discordGuild).restartModule(module)
        } catch (err) {
            log.debug(err)
            return this.sendError(send, err)
        }

        return send(success())
    }

    /**
     * Update a module-instance's configuration
     */
    async updateConfig(
        validationError: ValidationError,
        { instanceId, newConfig }: {
            instanceId: string,
            newConfig: object
        },
        send: Function
    ) {
        if (validationError) {
            send(validationError)
            return
        }

        if (typeof newConfig !== "object") {
            return send(error(400, "New config is not an object"))
        }

        const model = await ModuleInstance.findBy("id", instanceId) as ModuleInstance
        const module = ModuleRegistry.getModule(model.module_key)

        if (!module.canUpdateConfig) {
            return send(error(400, "Cannot update configuration"))
        }

        const guild = await Guild.findBy("id", model.guild_id) as Guild
        await guild.fetchDiscordGuild(this.client)

        if (!(await this.socket.user.isAdmin(guild))) {
            throw send(error(403, "Missing permissions"))
        }

        try {
            await ModuleInstanceRegistry
                .guild(guild.discordGuild)
                .updateConfig(model, newConfig)
        } catch (err) {
            log.debug(err)
            return this.sendError(send, err)
        }

        send(success(newConfig))
    }
}
