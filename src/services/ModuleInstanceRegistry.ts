import Discord from "discord.js"
import log from "loglevel"
import Module from "../lib/Module"
import Collection from "../lib/Collection"
import Context from "../lib/Context"
import BroadcastChannel from "../services/BroadcastChannel"
import ModuleModel from "../models/Module"
import ModuleInstanceModel from "../models/ModuleInstance"
import ArgumentResolver, { ArgumentResolveTypes } from "./ArgumentResolver"
import type ModuleRegistry from "./ModuleRegistry"
import Argument from "../lib/Argument"

type GuildInstancesMap = {
    [guildId: string]: InstancesMap
}

type InstancesMap = {
    [instanceId: string]: Module
}

type GlobalInstancesMap = {
    [moduleKey: string]: Module
}

class ModuleInstanceRegistry {
    static moduleRegistry: typeof ModuleRegistry
    static instances: GuildInstancesMap = {}
    static globalInstances: GlobalInstancesMap = {}

    guild: Discord.Guild
    instances: InstancesMap

    /**
     * Create a ModuleRegistry instance bound to a guild
     */
    static guild(guild: Discord.Guild) {
        return new ModuleInstanceRegistry(guild)
    }

    /**
     * Restore all module instances, global ones and from the database
     */
    static async restoreInstances(client: Discord.Client) {
        // Start global modules independent from guilds
        const globalModules = ModuleInstanceRegistry.moduleRegistry.modules.filter(module => module.isGlobal)
        await Promise.all(globalModules.map(module => ModuleInstanceRegistry.startGlobalInstance(client, module)))

        // Start each guild's individual instances
        await Promise.all(client.guilds.cache.map(async guild => {
            const models = await ModuleInstanceModel.findAllBy("guild_id", guild.id) as Collection<ModuleInstanceModel>

            await Promise.all(models.map(model => {
                return ModuleInstanceRegistry.guild(guild).startInstanceFromModel(client, model)
            }))
        }))
    }

    /**
     * Start an instance of a global module (i.e. independent from guilds)
     */
    static async startGlobalInstance(client: Discord.Client, module: typeof Module) {
        if (!module.isGlobal) {
            throw new Error(`The module '${module.key}' is not global`)
        }

        if (module.key in ModuleInstanceRegistry.globalInstances) {
            throw new Error(`The module '${module.key}' is already running`)
        }

        const context = new Context({ client, module, instanceId: null })
        const instance = new module(context)
        await instance._start()

        ModuleInstanceRegistry.globalInstances[module.key] = instance
    }

    /**
     * Register a module instance
     */
    static registerInstance({ guild, instance, model }: {
        guild: Discord.Guild,
        instance: Module,
        model: ModuleInstanceModel
    }) {
        if (!this.instances[guild.id]) {
            this.instances[guild.id] = {}
        }

        this.instances[guild.id][model.id] = instance

        instance.on("update", () => {
            BroadcastChannel.emit("module-instance/update", instance)
        })
    }

    /**
     * Unregister a module instance
     */
    static unregisterInstance({ guild, model }: {
        guild: Discord.Guild,
        model: ModuleInstanceModel
    }) {
        delete this.instances[guild.id][model.id]
    }

    /**
     * Get module instances registered by a guild's id
     */
    static getInstancesFromGuildId(guildId: string) {
        return Object.values(this.instances[guildId] || {})
    }

    constructor(guild: Discord.Guild) {
        this.guild = guild

        if (!ModuleInstanceRegistry.instances[this.guild.id]) {
            ModuleInstanceRegistry.instances[this.guild.id] = {}
        }

        this.instances = ModuleInstanceRegistry.instances[this.guild.id]
    }

    /**
     * Check if an instance can be started for the guild
     */
    async canStartInstance(model: ModuleModel) {
        const module = ModuleInstanceRegistry.moduleRegistry.getModule(model.key)
        const instances = await ModuleInstanceModel.findByGuildAndModuleKey(this.guild, model.key)
        return instances.length < module.maxInstances
    }

    /**
     * Start an instance from arguments
     */
    async startInstance(client: Discord.Client, model: ModuleModel, args: Record<string, any>, isUserInvocation = true) {
        /**
         * Validate invocation
         */
        const module = ModuleInstanceRegistry.moduleRegistry.getModule(model)

        if (!(await this.canStartInstance(model))) {
            throw "Maximum amount of instances reached"
        }

        if (ModuleInstanceRegistry.moduleRegistry.isProtectedModule(module) && isUserInvocation) {
            throw "Illegal invocation"
        }

        /**
         * Create the instance
         */
        const instanceModel = new ModuleInstanceModel({
            module_key: model.key,
            guild_id: this.guild.id,
            config: null
        })
        
        const configValues = await this.resolveArgumentsToConfig(module, args, { shouldValidate: isUserInvocation })

        const config = new module.config(configValues)
        const context = new Context({
            client,
            guild: this.guild,
            module,
            instanceId: instanceModel.id
        })
        const instance = new module(context, config)

        instanceModel.config = instance.getConfig()

        ModuleInstanceRegistry.registerInstance({
            guild: this.guild,
            instance,
            model: instanceModel
        })

        await instanceModel.store()
        
        try {
            await instance._start()
        } catch (error) {
            log.error(`Error starting instance '${module.key}' for guild '${this.guild.name}' ('${this.guild.id}')`, error)
            await instanceModel.delete()
            ModuleInstanceRegistry.unregisterInstance({ guild: this.guild, model: instanceModel })
            throw error
        }

        if (isUserInvocation) {
            BroadcastChannel.emit("module-instance/start", instanceModel)
        }

        return instance
    }

    /**
     * Stop an instance
     */
    async stopInstance(model: ModuleInstanceModel) {
        const module = ModuleInstanceRegistry.moduleRegistry.getModule(model.module_key)

        if (module.isStatic) {
            throw "Module does not exist"
        }

        if (!(model.id in this.instances)) {
            throw "Instance does not exist"
        }

        if (model.guild_id !== this.guild.id) {
            throw "Instance does not belong to this guild"
        }

        try {
            await this.instances[model.id]._stop()
        } catch (error) {
            log.error(`Error stoppping instance '${module.key}' for guild '${this.guild.name}' ('${this.guild.id}')`, error)
            ModuleInstanceRegistry.unregisterInstance({ guild: this.guild, model })
            await model.delete()
            throw error
        }
        
        ModuleInstanceRegistry.unregisterInstance({ guild: this.guild, model })
        await model.delete()

        BroadcastChannel.emit("module-instance/stop", model)
    }

    /**
     * Restart an instance
     */
    async restartInstance(model: ModuleInstanceModel) {
        const module = ModuleInstanceRegistry.moduleRegistry.getModule(model.module_key)

        if (module.isStatic) {
            throw "Module does not exist"
        }

        if (!(model.id in this.instances)) {
            throw "Instance does not exist"
        }

        if (model.guild_id !== this.guild.id) {
            throw "Instance does not belong to this guild"
        }

        const instance = this.instances[model.id]

        await instance._stop()

        model.data = {}
        await model.update()

        await instance._start()

        model.config = instance.getConfig()
        await model.update()
    }

    /**
     * Start an instance from a model
     */
    async startInstanceFromModel(client: Discord.Client, model: ModuleInstanceModel) {
        await model.fetchModule()
        const module = ModuleInstanceRegistry.moduleRegistry.getModule(model.module)

        const configValues = await this.resolveArgumentsToConfig(module, model.config)
        const config = new module.config(configValues)
        const context = new Context({
            client,
            guild: this.guild,
            module,
            instanceId: model.id
        })
        const instance = new module(context, config)

        await instance._start()

        ModuleInstanceRegistry.registerInstance({ guild: this.guild, instance, model })

        return instance
    }

    /**
     * Update the configuration of a model
     */
    async updateConfig(model: ModuleInstanceModel, newConfigJSON: object) {
        const moduleModel = await ModuleModel.findBy("key", model.module_key) as ModuleModel
        const module = ModuleInstanceRegistry.moduleRegistry.getModule(moduleModel)
        const instance = this.instances[model.id]

        const newConfigValues = await this.resolveArgumentsToConfig(module, newConfigJSON)
        const newConfig = new module.config(newConfigValues)

        instance.config = newConfig
        model.config = newConfig
        await model.update()
    }

    /**
     * Start an instance of each static module for this guild
     */
    async startStaticModuleInstances(client: Discord.Client) {
        const modules = ModuleInstanceRegistry.moduleRegistry.modules.filter(
            module => module.isStatic
        )

        const models = await Promise.all(modules.map(
            async module => await ModuleModel.findBy("key", module.key) as ModuleModel
        ))

        await Promise.all(models.map(model => {
            const module = ModuleInstanceRegistry.moduleRegistry.getModule(model)
            const args = Object.fromEntries(
                module.args.map(arg => [arg.key, arg.defaultValue])
            )
            return this.startInstance(client, model, args, false)
        }))
    }

    /**
     * Convert arguments to objects (e.g. text channel id -> text channel)
     */
    async resolveArgumentsToConfig(module: typeof Module, args: Record<string, any>, options: {
        shouldValidate?: boolean
    } = {}) {
        options = {
            shouldValidate: true,
            ...options
        }

        let validateArgFn: Function = () => { }

        if (options.shouldValidate) {
            validateArgFn = (argument: Argument) => {
                if (typeof args[argument.key] === "undefined") {
                    throw `Missing argument: ${argument.name}`
                }
            }
        }

        const resolvedArgs: Record<string, ArgumentResolveTypes> = Object.fromEntries(
            await Promise.all(module.args.map(
                async (argument) => {
                    validateArgFn(argument)
                    const value = await ArgumentResolver.guild(this.guild).resolveArgument(argument, args[argument.key])
                    return [argument.key, value]
                }
            ))
        )

        return resolvedArgs
    }
}

export default ModuleInstanceRegistry
