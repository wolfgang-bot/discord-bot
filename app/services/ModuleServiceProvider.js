const glob = require("glob-promise")
const path = require("path")
const ModuleDAO = require("../models/Module.js")
const ModuleInstanceDAO = require("../models/ModuleInstance.js")
const Module = require("../lib/Module.js")
const LocaleServiceProvider = require("./LocaleServiceProvider.js")

const MODULES_DIR = path.join(__dirname, "..", "modules")

class ModuleServiceProvider {
    /**
     * Array<Module>
     */
    static modules = []

    /**
     * Map<GuildID, Map<InstanceId, ModuleInstance>>
     */
    static instances = {}

    /**
     * Load modules from all "/modules/.../modules.xml" files into the
     * "modules" array.
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
     * Get a module from ModuleServiceProvider.modules from a module model.
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
        await Promise.all(client.guilds.cache.map(async guild => {
            const models = await ModuleInstanceDAO.findAllBy("guild_id", guild.id)

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
     * @param {ModuleDAO} model
     * @return {Boolean}
     */
    async isLoaded(model) {
        const moduleInstance = await ModuleInstanceDAO.where(`module_id = '${model.id}' AND guild_id = '${this.guild.id}'`)
        return !!moduleInstance
    }

    /**
     * Stop the module's instance from this guild
     * 
     * @param {ModuleDAO} model
     */
    async stopModule(model) {
        const moduleInstance = await ModuleInstanceDAO.where(`module_id = '${model.id}' AND guild_id = ${this.guild.id}`)

        await this.instances[moduleInstance.id].stop()
        delete this.instances[moduleInstance.id]

        await moduleInstance.delete()
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
        const locale = await LocaleServiceProvider.guild(this.guild)

        if (await this.isLoaded(model)) {
            throw locale.translate("error_module_running")
        }

        const module = ModuleServiceProvider.getModule(model)

        const instance = await module.mainClass.fromArguments(client, this.guild, args)

        if (!instance) {
            throw locale.translate("error_illegal_invocation")
        }

        await instance.start()

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
     * Start a module from instance model
     * 
     * @param {Discord.Client} client
     * @param {ModuleInstanceDAO} model
     */
    async startModuleFromModel(client, model) {
        await model.fetchModule()

        const module = ModuleServiceProvider.getModule(model.module)

        const instance = await module.mainClass.fromConfig(client, this.guild, model.config)

        await instance.start()

        this.instances[model.id] = instance
        
        return instance
    }
}

module.exports = ModuleServiceProvider