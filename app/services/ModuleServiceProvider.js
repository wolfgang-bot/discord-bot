const glob = require("glob-promise")
const path = require("path")
const Module = require("../models/Module.js")
const ModuleInstance = require("../models/ModuleInstance.js")
const LocaleServiceProvider = require("./LocaleServiceProvider.js")

const MODULES_DIR = path.join(__dirname, "..", "modules")

class ModuleServiceProvider {
    static instances = {}

    /**
     * Get module names ("../Modules/*" folder names)
     * 
     * @return {Array<String>}
     */
    static getModuleNamesSync() {
        return glob.sync("?*/", { cwd: MODULES_DIR }).map(name => name.replace("/", ""))
    }

    /**
     * Get a module class from module
     * 
     * @param {Models.Module} model
     * @return {Object}
     */
    static getModule(model) {
        const Module = require(path.join(MODULES_DIR, model.name))
        Module.meta.name = model.name
        return Module
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
     * Load modules into database
     */
    static async loadModules() {
        const models = await Module.getAll()

        await Promise.all(modules.map(async name => {
            const isInDatabase = models.some(model => model.name === name)

            if (!isInDatabase) {
                const model = new Module({ name })
                await model.store()
            }
        }))
    }

    /**
     * Restore all module instances (e.g. after restart)
     * 
     * @param {Discord.Client} client
     */
    static async restoreInstances(client) {
        await Promise.all(client.guilds.cache.map(async guild => {
            const models = await ModuleInstance.findAllBy("guild_id", guild.id)

            await Promise.all(models.map(model => {
                return ModuleServiceProvider.guild(guild).startModuleFromModel(client, model)
            }))
        }))
    }

    /**
     * Constructor
     * 
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
     * @param {Models.Module} model
     * @return {Boolean}
     */
    async isLoaded(model) {
        const moduleInstance = await ModuleInstance.where(`module_id = '${model.id}' AND guild_id = '${this.guild.id}'`)
        return !!moduleInstance
    }

    /**
     * Stop the module's instance from this guild
     * 
     * @param {Models.Module} model
     */
    async stopModule(model) {
        const moduleInstance = await ModuleInstance.where(`module_id = '${model.id}' AND guild_id = ${this.guild.id}`)

        await this.instances[moduleInstance.id].stop()
        delete this.instances[moduleInstance.id]

        await moduleInstance.delete()
    }

    /**
     * Start a module from arguments
     * 
     * @param {Discord.Client} client
     * @param {Models.Module} model
     * @param {Array<String>} args
     * @return {Object} Runtime module instance
     */
    async startModule(client, model, args) {
        const locale = await LocaleServiceProvider.guild(this.guild)

        if (await this.isLoaded(model)) {
            throw locale.translate("error_module_running")
        }

        const Module = ModuleServiceProvider.getModule(model)

        const instance = await Module.fromArguments(client, this.guild, args)

        if (!instance) {
            throw locale.translate("error_illegal_invocation")
        }

        await instance.start()

        const moduleInstance = new ModuleInstance({
            module_id: model.id,
            guild_id: this.guild.id,
            config: instance.getConfig()
        })

        await moduleInstance.store()
        
        this.instances[moduleInstance.id] = instance

        return instance
    }

    /**
     * Start a module from instance model
     * 
     * @param {Discord.Client} client
     * @param {Models.ModuleInstance} model
     */
    async startModuleFromModel(client, model) {
        await model.fetchModule()

        const Module = ModuleServiceProvider.getModule(model.module)
        const instance = await Module.fromConfig(client, this.guild, model.config)

        await instance.start()

        this.instances[model.id] = instance
        
        return instance
    }
}

const modules = ModuleServiceProvider.getModuleNamesSync()

module.exports = ModuleServiceProvider