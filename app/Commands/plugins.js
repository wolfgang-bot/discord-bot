const glob = require("glob")
const path = require("path")
const Command = require("../lib/Command.js")
const StorageFacade = require("../Facades/StorageFacade.js")

const PluginsEmbed = require("../Embeds/PluginsEmbed.js")

const PLUGINS_DIR = path.join(__dirname, "..", "Plugins")

const plugins = glob.sync("?*/", { cwd: PLUGINS_DIR }).map(name => name.replace("/", ""))

/**
 * Run sub-commands, list the plugins no sub-command is given
 */
async function run(args, message) {
    if (args.length === 0) {
        return await message.channel.send(new PluginsEmbed(plugins))
    }

    if (args[0] === "init") {
        return await initPlugin(args, message)
    }

    await message.channel.send("Unbekannter Command")
}

/**
 * Initialize plugin
 */
async function initPlugin(args, message) {
    const pluginName = args[1]

    if (!pluginName) {
        return await message.channel.send("Kein Plugin angegeben.")
    }

    if (!plugins.includes(pluginName)) {
        return await message.channel.send("Plugin existiert nicht.")
    }

    // Initialize the requested plugin
    let plugin
    try {
        const Plugin = require(path.join(PLUGINS_DIR, pluginName))

        plugin = await Plugin.fromMessage(message, args.slice(2))

        if (!plugin) {
            throw new Error("Illegal invocation")
        }

        await plugin.init()
    } catch (error) {
        return await message.channel.send("Plugin konnte nicht geladen werden")
    }

    // Store the plugin's configuration
    await StorageFacade.setItem("plugins." + pluginName, plugin.getConfig())

    await message.channel.send(`Plugin '${pluginName}' wurde erfolgreich geladen`)
} 

module.exports = new Command(run)
    .setDescription("Zeigt Plugins an.")
    .setUsage("plugins <command?>")
    .setPermissions(["MANAGE_GUILD"])