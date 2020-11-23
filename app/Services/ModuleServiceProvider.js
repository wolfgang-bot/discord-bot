const glob = require("glob-promise")
const path = require("path")
const StorageFacade = require("../Facades/StorageFacade.js")

const MODULES_DIR = path.join(__dirname, "..", "Modules")

class ModuleServiceProvider {
    static storagePrefix = "modules."

    static modules = {}
    
    static getModuleNamesSync() {
        return glob.sync("?*/", { cwd: MODULES_DIR }).map(name => name.replace("/", ""))
    }

    static getModule(moduleName) {
        const Module = require(path.join(MODULES_DIR, moduleName))
        Module.meta.name = moduleName
        return Module
    }

    static guild(guild) {
        return new ModuleServiceProvider(guild)
    }

    constructor(guild) {
        this.guild = guild

        this.modules = ModuleServiceProvider.modules[this.guild.id]

        if (!this.modules) {
            ModuleServiceProvider.modules[this.guild.id] = []
            this.modules = ModuleServiceProvider.modules[this.guild.id]
        }
    }

    isLoaded(name) {
        return this.modules.some(entry => entry.name === name)
    }

    getLoadedModules() {
        return this.modules
    }

    async startModuleFromMessage(name, message, args) {
        if (this.isLoaded(name)) {
            throw new Error("Module already loaded")
        }

        const Module = ModuleServiceProvider.getModule(name)

        const instance = await Module.fromMessage(message.client, this.guild, message, args)

        if (!instance) {
            throw new Error("Illegal invocation")
        }

        await instance.start()

        this.modules.push({ name, instance })

        return instance
    }

    async startModuleFromConfig(name, client, config) {
        const Module = ModuleServiceProvider.getModule(name)
        const instance = await Module.fromConfig(client, this.guild, config)

        await instance.start()
        
        this.modules.push({ name, instance })
        
        return instance
    }

    async stopModule(name) {
        const index = this.modules.findIndex(entry => entry.name === name)
        await this.modules[index].instance.stop()
        this.modules.splice(index, 1)
    }

    async restoreModules(client) {
        const modules = ModuleServiceProvider.getModuleNamesSync()

        return Promise.all(modules.map(async name => {
            const config = await StorageFacade.guild(this.guild).getItem(ModuleServiceProvider.storagePrefix + name)

            if (typeof config !== "undefined") {
                await this.startModuleFromConfig(name, client, config)
            }
        })) 
    }
}

module.exports = ModuleServiceProvider