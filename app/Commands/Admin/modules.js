const Command = require("../../lib/Command.js")
const StorageFacade = require("../../Facades/StorageFacade.js")
const ModuleServiceProvider = require("../../Services/ModuleServiceProvider.js")
const ModulesEmbed = require("../../Embeds/ModuleEmbed.js")
const ModuleHelpEmbed = require("../../Embeds/ModuleHelpEmbed.js")
const Guild = require("../../Models/Guild.js")

const modules = ModuleServiceProvider.getModuleNamesSync()

/**
 * Run sub-commands, list the modules no sub-command is given
 */
async function run(message, args) {
    if (args.length === 0) {
        const loaded = ModuleServiceProvider.guild(message.guild).getLoadedModules().map(entry => entry.name)
        const config = await Guild.config(message.guild)
        return await message.channel.send(new ModulesEmbed(config, { available: modules, loaded }))
    }

    if (args[0] === "start") {
        return await startModule(message, args)
    } 

    if (args[0] === "stop") {
        return await stopModule(message, args)
    }

    if (args[0] === "help") {
        return await helpModule(message, args)
    }

    await message.channel.send("Unbekannter Command")
}

/**
 * Start module
 */
async function startModule(message, args) {
    const moduleName = args[1]

    if (!moduleName) {
        return await message.channel.send("Kein Modul angegeben")
    }

    if (!modules.includes(moduleName)) {
        return await message.channel.send("Das Modul existiert nicht")
    }

    if (ModuleServiceProvider.guild(message.guild).isLoaded(moduleName)) {
        return await message.channel.send("Das Modul ist bereits gestartet")
    }

    // Start the requested module
    let instance
    try {
        instance = await ModuleServiceProvider.guild(message.guild).startModuleFromMessage(moduleName, message, args.slice(2))
    } catch(error) {
        if (process.env.NODE_ENV === "development") {
            console.error(error)
        }
        
        return await message.channel.send("Das Modul konnte nicht gestartet werden")
    }

    // Store the instance's configuration
    await StorageFacade.guild(message.guild).setItem(ModuleServiceProvider.storagePrefix + moduleName, instance.getConfig())

    await message.channel.send(`Das Modul '${moduleName}' wurde erfolgreich gestartet`)
}

/**
 * Stop module
 */
async function stopModule(message, args) {
    const moduleName = args[1]

    if (!moduleName) {
        return await message.channel.send("Kein Modul angegeben")
    }

    if (!ModuleServiceProvider.guild(message.guild).isLoaded(moduleName)) {
        return await message.channel.send("Das Modul ist nicht gestartet")
    }

    await ModuleServiceProvider.guild(message.guild).stopModule(moduleName)
    await StorageFacade.guild(message.guild).deleteItem(ModuleServiceProvider.storagePrefix + moduleName)

    await message.channel.send(`Modul '${moduleName}' wurde erfolgreich gestoppt`)
}

/**
 * Send module's help message
 */
async function helpModule(message, args) {
    const moduleName = args[1]

    if (!moduleName) {
        return await message.channel.send("Kein Modul angegeben")
    }

    if (!modules.includes(moduleName)) {
        return await message.channel.send("Das Modul existiert nicht")
    }

    const module = ModuleServiceProvider.getModule(moduleName)
    const config = await Guild.config(message.guild)
    await message.channel.send(config, new ModuleHelpEmbed(config, module))
}

module.exports = new Command(run)
    .setDescription("Zeigt Informationen über die Module an.")
    .setArguments("[start|stop|help] [module]")
    .setAlias(["module"])
    .setPermissions(["MANAGE_GUILD"])