const glob = require("glob")
const path = require("path")
const StorageFacade = require("../Facades/StorageFacade.js")

const PLUGINS_DIR = path.join(__dirname, "..", "Plugins")

class PluginServiceProvider {
    static plugins = []

    static isLoaded(name) {
        return PluginServiceProvider.plugins.some(entry => entry.name === name)
    }

    static getLoadedPlugins() {
        return PluginServiceProvider.plugins
    }

    static getPluginNamesSync() {
        return glob.sync("?*/", { cwd: PLUGINS_DIR }).map(name => name.replace("/", ""))
    }

    static async startPluginFromMessage(name, message, args) {
        if (PluginServiceProvider.isLoaded(name)) {
            throw new Error("Plugin already loaded")
        }

        const Plugin = require(path.join(PLUGINS_DIR, name))

        const plugin = await Plugin.fromMessage(message, args)

        if (!plugin) {
            throw new Error("Illegal invocation")
        }

        await plugin.start()

        PluginServiceProvider.plugins.push({ name, instance: plugin })

        return plugin
    }

    static async startPluginFromConfig(name, client, config) {
        const Plugin = require(path.join(PLUGINS_DIR, name))
        const plugin = await Plugin.fromConfig(client, config)

        await plugin.start()
        
        PluginServiceProvider.plugins.push({ name, instance: plugin })
        
        return plugin
    }

    static async stopPlugin(name) {
        const index = PluginServiceProvider.plugins.findIndex(entry => entry.name === name)
        await PluginServiceProvider.plugins[index].instance.stop()
        PluginServiceProvider.plugins.splice(index, 1)
    }

    static async restorePlugins(client) {
        const plugins = PluginServiceProvider.getPluginNamesSync()

        await Promise.all(plugins.map(async name => {
            const config = await StorageFacade.getItem("plugins." + name)

            if (config) {
                await PluginServiceProvider.startPluginFromConfig(name, client, config)
            }
        }))
    }
}

module.exports = PluginServiceProvider