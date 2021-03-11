import Discord from "discord.js"
import log from "loglevel"
import Module from "../lib/Module"
import Collection from "../lib/Collection"
import Context from "../lib/Context"
import BroadcastChannel from "../services/BroadcastChannel"
import ModuleModel from "../models/Module"
import ModuleInstanceModel from "../models/ModuleInstance"
import LocaleProvider from "./LocaleProvider"
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
     * Restore all module instances (e.g. after restart)
     */
    static async restoreInstances(client: Discord.Client) {
        // Start global modules independent from guilds
        const globalModules = ModuleInstanceRegistry.moduleRegistry.modules.filter(module => module.isGlobal)
        await Promise.all(globalModules.map(module => ModuleInstanceRegistry.startGlobalModule(client, module)))

        // Start each guild's individual instances
        await Promise.all(client.guilds.cache.map(async guild => {
            const models = await ModuleInstanceModel.findAllBy("guild_id", guild.id) as Collection<ModuleInstanceModel>

            await Promise.all(models.map(model => {
                return ModuleInstanceRegistry.guild(guild).startModuleFromInstanceModel(client, model)
            }))
        }))
    }

    /**
     * Start a global module (i.e. independent from guilds)
     */
    static async startGlobalModule(client: Discord.Client, module: typeof Module) {
        if (!module.isGlobal) {
            throw new Error(`The module '${module.key}' is not global`)
        }

        if (module.key in ModuleInstanceRegistry.globalInstances) {
            throw new Error(`The module '${module.key}' is already running`)
        }

        const instance = new module({ client, module })
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
            BroadcastChannel.emit("module-instances/update", instance)
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
     * Check if a module is loaded for this guild
     */
    async isLoaded(model: ModuleModel) {
        const moduleInstance = await ModuleInstanceModel.findByGuildAndModuleKey(this.guild, model.key)
        return !!moduleInstance
    }

    /**
     * Start a module from arguments
     */
    async startModule(client: Discord.Client, model: ModuleModel, args: Record<string, any>, isUserInvocation = true) {
        /**
         * Validate invocation
         */
        const module = ModuleInstanceRegistry.moduleRegistry.getModule(model)

        if (isUserInvocation) {
            const locale = await LocaleProvider.guild(this.guild)
    
            if (await this.isLoaded(model)) {
                throw locale.translate("error_module_running")
            }
    
            if (ModuleInstanceRegistry.moduleRegistry.isProtectedModule(module) && isUserInvocation) {
                throw locale.translate("error_illegal_invocation")
            }
        }

        /**
         * Create the instance
         */
        const configValues = await this.resolveArgumentsToConfig(module, args, { shouldValidate: isUserInvocation })

        const config = new module.config(configValues)
        const context = new Context({ client, guild: this.guild, module })
        const instance = new module(context, config)

        const instanceModel = new ModuleInstanceModel({
            module_key: model.key,
            guild_id: this.guild.id,
            config: instance.getConfig()
        })

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

        return instance
    }

    /**
     * Stop the module's instance from this guild
     */
    async stopModule(model: ModuleModel) {
        const moduleInstance = await ModuleInstanceModel.findByGuildAndModuleKey(this.guild, model.key)

        const locale = await LocaleProvider.guild(this.guild)
        
        const module = ModuleInstanceRegistry.moduleRegistry.getModule(model)
        if (module.isStatic) {
            throw locale.translate("error_module_does_not_exist", module.key)
        }

        if (!moduleInstance) {
            throw locale.translate("error_module_not_running")
        }

        try {
            await this.instances[moduleInstance.id]._stop()
        } catch (error) {
            log.error(`Error stoppping instance '${module.key}' for guild '${this.guild.name}' ('${this.guild.id}')`, error)
            ModuleInstanceRegistry.unregisterInstance({ guild: this.guild, model: moduleInstance })
            await moduleInstance.delete()
            throw error
        }
        
        ModuleInstanceRegistry.unregisterInstance({ guild: this.guild, model: moduleInstance })
        await moduleInstance.delete()
    }

    /**
     * Restart a module's instance
     */
    async restartModule(moduleModel: ModuleModel) {
        const locale = await LocaleProvider.guild(this.guild)

        const module = ModuleInstanceRegistry.moduleRegistry.getModule(moduleModel)
        if (module.isStatic) {
            throw locale.translate("error_module_does_not_exist", module.key)
        }

        const model = await ModuleInstanceModel.findByGuildAndModuleKey(this.guild, moduleModel.key)

        if (!model) {
            throw locale.translate("error_module_not_running")
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
     * Start a module from instance model
     */
    async startModuleFromInstanceModel(client: Discord.Client, model: ModuleInstanceModel) {
        await model.fetchModule()
        const module = ModuleInstanceRegistry.moduleRegistry.getModule(model.module)

        const configValues = await this.resolveArgumentsToConfig(module, model.config)
        const config = new module.config(configValues)
        const context = new Context({ client, guild: this.guild, module })
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
     * Start all static modules for a guild
     */
    async startStaticModules(client: Discord.Client) {
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
            return this.startModule(client, model, args, false)
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
            const locale = await LocaleProvider.guild(this.guild)
            const moduleLocale = locale.scope(module.key)
            validateArgFn = (argument: Argument) => {
                if (!args[argument.key]) {
                    throw locale.translate("error_missing_argument", moduleLocale.translate(argument.name))
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
