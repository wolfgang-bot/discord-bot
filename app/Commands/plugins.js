const Command = require("../lib/Command.js")
const StorageFacade = require("../Facades/StorageFacade.js")
const PluginServiceProvider = require("../Services/PluginServiceProvider.js")
const PluginsEmbed = require("../Embeds/PluginsEmbed.js")

const plugins = PluginServiceProvider.getPluginNamesSync()

/**
 * Run sub-commands, list the plugins no sub-command is given
 */
async function run(args, message) {
    if (args.length === 0) {
        const loaded = PluginServiceProvider.getLoadedPlugins().map(entry => entry.name)
        return await message.channel.send(new PluginsEmbed({ available: plugins, loaded }))
    }

    if (args[0] === "start") {
        return await startPlugin(args, message)
    } 

    if (args[0] === "stop") {
        return await stopPlugin(args, message)
    }

    await message.channel.send("Unbekannter Command")
}

/**
 * Start plugin
 */
async function startPlugin(args, message) {
    const pluginName = args[1]

    if (!pluginName) {
        return await message.channel.send("Kein Plugin angegeben")
    }

    if (!plugins.includes(pluginName)) {
        return await message.channel.send("Plugin existiert nicht")
    }

    if (PluginServiceProvider.isLoaded(pluginName)) {
        return await message.channel.send("Plugin ist bereits gestartet")
    }

    // Start the requested plugin
    let plugin
    try {
        plugin = await PluginServiceProvider.startPluginFromMessage(pluginName, message, args.slice(2))
    } catch {
        return await message.channel.send("Plugin konnte nicht gestartet werden")
    }

    // Store the plugin's configuration
    await StorageFacade.setItem("plugins." + pluginName, plugin.getConfig())

    await message.channel.send(`Plugin '${pluginName}' wurde erfolgreich gestartet`)
}

/**
 * Stop plugin
 */
async function stopPlugin(args, message) {
    const pluginName = args[1]

    if (!pluginName) {
        return await message.channel.send("Kein Plugin angegeben")
    }

    if (!PluginServiceProvider.isLoaded(pluginName)) {
        return await message.channel.send("Plugin ist nicht gestartet")
    }

    await PluginServiceProvider.stopPlugin(pluginName)
    await StorageFacade.deleteItem("plugins." + pluginName)

    await message.channel.send(`Plugin '${pluginName}' wurde erfolgreich gestoppt`)
}

module.exports = new Command(run)
    .setDescription("Zeigt Plugins an.")
    .setUsage("plugins [start|stop] [plugin]")
    .setPermissions(["MANAGE_GUILD"])