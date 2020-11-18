const glob = require("glob")
const path = require("path")
const StorageFacade = require("../Facades/StorageFacade.js")

const MODULES_DIR = path.join(__dirname, "..", "Modules")

class ModuleServiceProvider {
    static modules = []

    static storagePrefix = "modules."

    static isLoaded(name) {
        return ModuleServiceProvider.modules.some(entry => entry.name === name)
    }

    static getLoadedModules() {
        return ModuleServiceProvider.modules
    }

    static getModuleNamesSync() {
        return glob.sync("?*/", { cwd: MODULES_DIR }).map(name => name.replace("/", ""))
    }

    static async startModuleFromMessage(name, message, args) {
        if (ModuleServiceProvider.isLoaded(name)) {
            throw new Error("Module already loaded")
        }

        const Module = require(path.join(MODULES_DIR, name))

        const instance = await Module.fromMessage(message, args)

        if (!instance) {
            throw new Error("Illegal invocation")
        }

        await instance.start()

        ModuleServiceProvider.modules.push({ name, instance })

        return instance
    }

    static async startModuleFromConfig(name, client, config) {
        const Module = require(path.join(MODULES_DIR, name))
        const instance = await Module.fromConfig(client, config)

        await instance.start()
        
        ModuleServiceProvider.modules.push({ name, instance })
        
        return instance
    }

    static async stopModule(name) {
        const index = ModuleServiceProvider.modules.findIndex(entry => entry.name === name)
        await ModuleServiceProvider.modules[index].instance.stop()
        ModuleServiceProvider.modules.splice(index, 1)
    }

    static async restoreModules(client) {
        const modules = ModuleServiceProvider.getModuleNamesSync()

        await Promise.all(modules.map(async name => {
            const config = await StorageFacade.getItem(ModuleServiceProvider.storagePrefix + name)

            if (config) {
                await ModuleServiceProvider.startModuleFromConfig(name, client, config)
            }
        }))
    }
}

module.exports = ModuleServiceProvider