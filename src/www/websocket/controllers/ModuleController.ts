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
    ValidationError,
    ModuleInstanceGuildAdminValidator
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

        this.instanceValidationPipeline = new ValidationPipeline(client, [
            new ModuleInstanceExistsValidator(error(404, "Instance not found")),
            new ModuleInstanceGuildAdminValidator(error(403))
        ])

        const makeGuildArgs = ({ guildId }) => ({
            guildId,
            user: this.socket.user
        })

        const makeModuleArgs = ({ guildId, moduleKey }) => ({
            ...makeGuildArgs({ guildId }),
            moduleKey
        })

        const makeInstanceArgs = ({ instanceId }) => ({
            instanceId,
            user: this.socket.user
        })

        this.getInstances = this.guildValidationPipeline.bind(this.getInstances.bind(this), makeGuildArgs)

        this.validateArguments = this.moduleValidationPipeline.bind(this.validateArguments.bind(this), makeModuleArgs)
        this.startInstance = this.moduleValidationPipeline.bind(this.startInstance.bind(this), makeModuleArgs)
        
        this.stopInstance = this.instanceValidationPipeline.bind(this.stopInstance.bind(this), makeInstanceArgs)
        this.restartInstance = this.instanceValidationPipeline.bind(this.restartInstance.bind(this), makeInstanceArgs)
        this.updateConfig = this.instanceValidationPipeline.bind(this.updateConfig.bind(this), makeInstanceArgs)
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
            await ModuleInstanceRegistry
                .guild(guild.discordGuild)
                .startInstance(this.client, module, args)
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
        { instanceId }: { instanceId: string },
        send: Function
    ) {
        if (validationError) {
            send(validationError)
            return
        }

        const instance = await ModuleInstance.findBy("id", instanceId) as ModuleInstance
        await instance.fetchGuild()
        await instance.guild.fetchDiscordGuild(this.client)

        try {
            await ModuleInstanceRegistry
                .guild(instance.guild.discordGuild)
                .stopInstance(instance)
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
        { instanceId }: { instanceId: string },
        send: Function
    ) {
        if (validationError) {
            send(validationError)
            return
        }
        
        const instance = await ModuleInstance.findBy("id", instanceId) as ModuleInstance
        await instance.fetchGuild()
        await instance.guild.fetchDiscordGuild(this.client)

        try {
            await ModuleInstanceRegistry
                .guild(instance.guild.discordGuild)
                .restartInstance(instance)
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

        const instance = await ModuleInstance.findBy("id", instanceId) as ModuleInstance
        const module = ModuleRegistry.getModule(instance.module_key)

        if (!module.canUpdateConfig) {
            return send(error(400, "Cannot update configuration"))
        }

        await instance.fetchGuild()
        await instance.guild.fetchDiscordGuild(this.client)

        try {
            await ModuleInstanceRegistry
                .guild(instance.guild.discordGuild)
                .updateConfig(instance, newConfig)
        } catch (err) {
            log.debug(err)
            return this.sendError(send, err)
        }

        send(success(newConfig))
    }
}
