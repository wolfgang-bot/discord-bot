import glob from "glob-promise"
import path from "path"
import Discord from "discord.js"
import { EventEmitter } from "events"
import Module from "../lib/Module"
import Collection from "../lib/Collection"
import Context from "../lib/Context"
import ModuleModel from "../models/Module"
import ModuleInstanceModel from "../models/ModuleInstance"
import LocaleServiceProvider from "./LocaleServiceProvider"
import ArgumentServiceProvider, { ArgumentResolveTypes } from "./ArgumentServiceProvider"

type GuildInstancesMap = {
    [guildId: string]: InstancesMap
}

type InstancesMap = {
    [instanceId: string]: Module
}

type GlobalInstancesMap = {
    [moduleName: string]: Module
}

const MODULES_DIR = path.join(__dirname, "..", "modules")

class ModuleServiceProvider {
    static modules: (typeof Module)[] = []
    static instances: GuildInstancesMap = {}
    static globalInstances: GlobalInstancesMap = {}
    static eventEmitter: EventEmitter = new EventEmitter()

    guild: Discord.Guild
    instances: InstancesMap

    /**
     * Load modules from all "src/modules/.../modules.xml" files
     */
    static async loadModules() {
        const files = await glob("?*/module.xml", { cwd: MODULES_DIR })

        await Promise.all(files.map(async filepath => {
            const module = require(path.join(MODULES_DIR, filepath, "..", "index")).default as typeof Module

            await module.loadXMLFile(path.join(MODULES_DIR, filepath))

            ModuleServiceProvider.modules.push(module)
        }))
    }

    /**
     * Get a module class from a database model
     */
    static getModule(model: ModuleModel) {
        return ModuleServiceProvider.modules.find(module => module.internalName === model.name)
    }

    /**
     * Create a ModuleServiceProvider instance bound to a guild
     */
    static guild(guild: Discord.Guild) {
        return new ModuleServiceProvider(guild)
    }

    /**
     * Load missing modules into database
     */
    static async loadModulesToDB() {
        const models = await ModuleModel.getAll() as Collection<ModuleModel>

        await Promise.all(ModuleServiceProvider.modules.map(async module => {
            const isInDatabase = models.some(model => model.name === module.internalName)

            if (!isInDatabase) {
                const model = new ModuleModel({
                    name: module.internalName
                })
                await model.store()
            }
        }))
    }

    /**
     * Restore all module instances (e.g. after restart)
     */
    static async restoreInstances(client: Discord.Client) {
        // Start global modules independent from guilds
        const globalModules = ModuleServiceProvider.modules.filter(module => module.isGlobal)
        await Promise.all(globalModules.map(module => ModuleServiceProvider.startGlobalModule(client, module)))

        // Start each guild's individual instances
        await Promise.all(client.guilds.cache.map(async guild => {
            const models = await ModuleInstanceModel.findAllBy("guild_id", guild.id) as Collection<ModuleInstanceModel>

            await Promise.all(models.map(model => {
                return ModuleServiceProvider.guild(guild).startModuleFromInstanceModel(client, model)
            }))
        }))
    }

    /**
     * Start a global module (i.e. independent from guilds)
     */
    static async startGlobalModule(client: Discord.Client, module: typeof Module) {
        if (!module.isGlobal) {
            throw new Error(`The module '${module.name}' is not global`)
        }

        if (module.internalName in ModuleServiceProvider.globalInstances) {
            throw new Error(`The module '${module.internalName}' is already running`)
        }

        const instance = new module({ client })
        await instance._start()

        ModuleServiceProvider.globalInstances[module.name] = instance
    }

    /**
     * Fill a module's translation map
     */
    static translate(module: typeof Module) {
        const moduleLocale = new LocaleServiceProvider().scope(module.internalName)

        module.translations = {
            desc: moduleLocale.translate(module.desc),

            features: moduleLocale.translateArray(module.features),
            
            args: module.args.map(arg => {
                const newArg = arg.clone()

                newArg.name = moduleLocale.translate(arg.name)
                newArg.displayName = moduleLocale.translate(arg.displayName)
                newArg.desc = moduleLocale.translate(arg.desc)

                return newArg
            })
        }
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
            this.eventEmitter.emit("update", instance)
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

    constructor(guild: Discord.Guild) {
        this.guild = guild

        if (!ModuleServiceProvider.instances[this.guild.id]) {
            ModuleServiceProvider.instances[this.guild.id] = {}
        }

        this.instances = ModuleServiceProvider.instances[this.guild.id]
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
        const locale = await LocaleServiceProvider.guild(this.guild)
        const moduleLocale = locale.scope(model.name)

        if (await this.isLoaded(model)) {
            throw locale.translate("error_module_running")
        }

        const module = ModuleServiceProvider.getModule(model)

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

            return ArgumentServiceProvider.guild(this.guild).resolveArgument(argument, args[i])
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
        
        ModuleServiceProvider.registerInstance({
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
            const locale = await LocaleServiceProvider.guild(this.guild)
            throw locale.translate("error_module_not_running")
        }

        await this.instances[moduleInstance.id]._stop()

        ModuleServiceProvider.unregisterInstance({ guild: this.guild, model: moduleInstance })

        await moduleInstance.delete()
    }

    /**
     * Restart a module's instance
     */
    async restartModule(module: ModuleModel) {
        const model = await ModuleInstanceModel.where(`module_id = '${module.id}' AND guild_id = '${this.guild.id}'`) as ModuleInstanceModel

        if (!model) {
            const locale = await LocaleServiceProvider.guild(this.guild)
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
        const module = ModuleServiceProvider.getModule(model.module)

        const context = new Context({ client, guild: this.guild, module })
        const config = await module.makeConfigFromJSON(context, model.config)
        const instance = new module(context, config)

        await instance._start()

        ModuleServiceProvider.registerInstance({ guild: this.guild, instance, model })
        
        return instance
    }
}

export default ModuleServiceProvider