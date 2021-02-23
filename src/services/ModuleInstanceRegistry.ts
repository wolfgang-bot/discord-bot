import Discord from "discord.js"
import Module from "../lib/Module"
import Collection from "@personal-discord-bot/shared/dist/orm/Collection"
import Context from "../lib/Context"
import BroadcastChannel from "../services/BroadcastChannel"
import ModuleModel from "@personal-discord-bot/shared/dist/models/Module"
import ModuleInstanceModel from "@personal-discord-bot/shared/dist/models/ModuleInstance"
import LocaleProvider from "./LocaleProvider"
import ArgumentResolver, { ArgumentResolveTypes } from "./ArgumentResolver"
import type ModuleRegistry from "./ModuleRegistry"

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
        const moduleInstance = await ModuleInstanceModel.where(`module_id = '${model.id}' AND guild_id = '${this.guild.id}'`)
        return !!moduleInstance
    }

    /**
     * Start a module from arguments
     */
    async startModule(client: Discord.Client, model: ModuleModel, args: string[]) {
        /**
         * Validate invocation
         */
        const locale = await LocaleProvider.guild(this.guild)
        const moduleLocale = locale.scope(model.key)

        if (await this.isLoaded(model)) {
            throw locale.translate("error_module_running")
        }

        const module = ModuleInstanceRegistry.moduleRegistry.getModule(model)

        if (module.isGlobal) {
            throw locale.translate("error_illegal_invocation")
        }

        /**
         * Convert arguments to objects (e.g. text channel id -> text channel)
         */
        const resolvedArgs: ArgumentResolveTypes[] = await Promise.all(module.args.map((argument, i) => {
            if (!args[i]) {
                throw locale.translate("error_missing_argument", moduleLocale.translate(argument.name))
            }

            return ArgumentResolver.guild(this.guild).resolveArgument(argument, args[i])
        }))

        /**
         * Create the instance
         */
        const context = new Context({ client, guild: this.guild, module })
        const config = module.makeConfigFromArgs(resolvedArgs)
        const instance = new module(context, config)

        if (!instance) {
            throw locale.translate("error_illegal_invocation")
        }

        const instanceModel = new ModuleInstanceModel({
            module_id: model.id,
            guild_id: this.guild.id,
            config: instance.getConfig()
        })

        ModuleInstanceRegistry.registerInstance({
            guild: this.guild,
            instance,
            model: instanceModel
        })

        await instance._start()

        await instanceModel.store()

        return instance
    }

    /**
     * Stop the module's instance from this guild
     */
    async stopModule(model: ModuleModel) {
        const moduleInstance = await ModuleInstanceModel.where(
            `module_id = '${model.id}' AND guild_id = ${this.guild.id}`
        ) as ModuleInstanceModel

        if (!moduleInstance) {
            const locale = await LocaleProvider.guild(this.guild)
            throw locale.translate("error_module_not_running")
        }

        await this.instances[moduleInstance.id]._stop()

        ModuleInstanceRegistry.unregisterInstance({ guild: this.guild, model: moduleInstance })

        await moduleInstance.delete()
    }

    /**
     * Restart a module's instance
     */
    async restartModule(module: ModuleModel) {
        const model = await ModuleInstanceModel.where(`module_id = '${module.id}' AND guild_id = '${this.guild.id}'`) as ModuleInstanceModel

        if (!model) {
            const locale = await LocaleProvider.guild(this.guild)
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

        const context = new Context({ client, guild: this.guild, module })
        const config = await module.makeConfigFromJSON(context, model.config)
        const instance = new module(context, config)

        await instance._start()

        ModuleInstanceRegistry.registerInstance({ guild: this.guild, instance, model })

        return instance
    }
}

export default ModuleInstanceRegistry
