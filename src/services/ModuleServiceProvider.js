const glob = require("glob-promise")
const path = require("path")

const Module = require("../structures/Module.js")
const Context = require("../structures/Context.js")
const ModuleDAO = require("../models/Module.js")
const ModuleInstanceDAO = require("../models/ModuleInstance.js")
const LocaleServiceProvider = require("./LocaleServiceProvider.js")
const ArgumentServiceProvider = require("./ArgumentServiceProvider.js")

const MODULES_DIR = path.join(__dirname, "..", "modules")

class ModuleServiceProvider {
    /**
     * All modules from the "src/modules" directory
     * 
     * @type {Array<Module>}
     */
    static modules = []

    /**
     * Module instances mapped by the guild's id which initialized it
     * 
     * @type {Object<GuildID, Object<InstanceId, Module>>}
     */
    static instances = {}

    /**
     * Global module instances
     * 
     * @type {Array<ModuleName, Module>}
     */
    static globalInstances = {}

    /**
     * Load modules from all "src/modules/.../modules.xml" files into the
     * "modules" array
     */
    static async loadModules() {
        const files = await glob("?*/module.xml", { cwd: MODULES_DIR })

        await Promise.all(files.map(async filepath => {
            const module = await Module.fromXMLFile(path.join(MODULES_DIR, filepath))

            module.mainClass = require(path.join(MODULES_DIR, filepath, "..", "index.js"))

            ModuleServiceProvider.modules.push(module)
        }))
    }

    /**
     * Get a module from ModuleServiceProvider.modules from a module model
     * 
     * @param {ModuleDAO} model
     * @return {Module}
     */
    static getModule(model) {
        return ModuleServiceProvider.modules.find(module => module.name === model.name)
    }

    /**
     * Create a ModuleServiceProvider instance bound to a guild
     * 
     * @param {Discord.Guild} guild
     * @returns {ModuleServiceProvider}
     */
    static guild(guild) {
        return new ModuleServiceProvider(guild)
    }

    /**
     * Load missing modules into database
     */
    static async loadModulesToDB() {
        const models = await ModuleDAO.getAll()

        await Promise.all(ModuleServiceProvider.modules.map(async module => {
            const isInDatabase = models.some(model => model.name === module.name)

            if (!isInDatabase) {
                const model = new ModuleDAO({
                    name: module.name
                })
                await model.store()
            }
        }))
    }

    /**
     * Restore all module instances (e.g. after restart of the bot)
     * 
     * @param {Discord.Client} client
     */
    static async restoreInstances(client) {
        // Start global modules independent from guilds
        const globalModules = ModuleServiceProvider.modules.filter(module => module.isGlobal)

        await Promise.all(globalModules.map(module => ModuleServiceProvider.startGlobalModule(client, module)))

        // Start each guild's individual instances
        await Promise.all(client.guilds.cache.map(async guild => {
            const models = await ModuleInstanceDAO.findAllBy("guild_id", guild.id)

            await Promise.all(models.map(model => {
                return ModuleServiceProvider.guild(guild).startModuleFromModel(client, model)
            }))
        }))
    }

    /**
     * Start a global module independent from guilds.
     * 
     * @param {Discord.Client} client
     * @param {Module} module
     */
    static async startGlobalModule(client, module) {
        if (!module.isGlobal) {
            throw new Error(`The module '${module.name}' is not global`)
        }

        if (module.name in ModuleServiceProvider.globalInstances) {
            throw new Error(`The module '${module.name}' is already running`)
        }

        const instance = new module.mainClass({ client, module })
        await instance.start()

        ModuleServiceProvider.globalInstances[module.name] = instance
    }

    /**
     * Create a new module which contains the replaced translations instead of the raw keys
     * 
     * @param {Module} module
     */
    static translate(module) {
        const moduleLocale = new LocaleServiceProvider().scope(module.name)

        const newModule = new Module({
            ...module,
            name: module.name,
            desc: moduleLocale.translate(module.desc),
            features: moduleLocale.translate(module.features),
            args: module.args.map(arg => ({
                ...arg,
                name: moduleLocale.translate(arg.name),
                displayName: moduleLocale.translate(arg.displayName),
                desc: moduleLocale.translate(arg.desc)
            }))
        })

        return newModule
    }

    /**
     * @param {Discord.Guild} guild
     */
    constructor(guild) {
        this.guild = guild

        // Create a reference to the instances array
        this.instances = ModuleServiceProvider.instances[this.guild.id]

        if (!this.instances) {
            ModuleServiceProvider.instances[this.guild.id] = {}
            this.instances = ModuleServiceProvider.instances[this.guild.id]
        }
    }

    /**
     * Check if a module is loaded for this guild
     * 
     * @param {ModuleDAO} model
     * @return {Boolean}
     */
    async isLoaded(model) {
        const moduleInstance = await ModuleInstanceDAO.where(`module_id = '${model.id}' AND guild_id = '${this.guild.id}'`)
        return !!moduleInstance
    }

    /**
     * Start a module from arguments
     * 
     * @param {Discord.Client} client
     * @param {ModuleDAO} model
     * @param {Array<String>} args
     * @return {Object} Runtime module instance
     */
    async startModule(client, model, args) {
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
        args = await Promise.all(module.args.map((argument, i) => {
            if (!args[i]) {
                throw locale.translate("error_missing_argument", moduleLocale.translate(argument.name))
            }

            return ArgumentServiceProvider.guild(this.guild).convertArgument(argument, args[i])
        }))


        /**
         * Create the instance
         */
        const context = new Context({ client, guild: this.guild, module })
        const config = module.mainClass.makeConfigFromArgs(args)
        const instance = new module.mainClass(context, config)

        if (!instance) {
            throw locale.translate("error_illegal_invocation")
        }
        
        await instance.start()
        
        /**
         * Store the instance
         */
        const moduleInstance = new ModuleInstanceDAO({
            module_id: model.id,
            guild_id: this.guild.id,
            config: instance.getConfig()
        })

        await moduleInstance.store()
        
        this.instances[moduleInstance.id] = instance

        return instance
    }

    /**
     * Stop the module's instance from this guild
     * 
     * @param {ModuleDAO} model
     */
    async stopModule(model) {
        const moduleInstance = await ModuleInstanceDAO.where(`module_id = '${model.id}' AND guild_id = ${this.guild.id}`)

        if (!moduleInstance) {
            const locale = await LocaleServiceProvider.guild(this.guild)
            throw locale.translate("error_module_not_running")
        }

        await this.instances[moduleInstance.id].stop()
        delete this.instances[moduleInstance.id]

        await moduleInstance.delete()
    }

    /**
     * Restart a module's instance
     * 
     * @param {ModuleDAO} module
     */
    async restartModule(module) {
        const model = await ModuleInstanceDAO.where(`module_id = '${module.id}' AND guild_id = '${this.guild.id}'`)

        if (!model) {
            const locale = await LocaleServiceProvider.guild(this.guild)
            throw locale.translate("error_module_not_running")
        }

        const instance = this.instances[model.id]

        await instance.stop()

        model.data = {}
        await model.update()
        
        await instance.start()

        model.config = instance.getConfig()
        await model.update()
    }

    /**
     * Start a module from instance model
     * 
     * @param {Discord.Client} client
     * @param {ModuleInstanceDAO} model
     */
    async startModuleFromModel(client, model) {
        // Get module
        await model.fetchModule()
        const module = ModuleServiceProvider.getModule(model.module)

        // Create instance
        const context = new Context({ client, guild: this.guild, module })
        const config = await module.mainClass.makeConfigFromJSON(context, model.config)
        const instance = new module.mainClass(context, config)

        // Start instance
        await instance.start()

        // Store instance
        this.instances[model.id] = instance
        
        return instance
    }
}

module.exports = ModuleServiceProvider