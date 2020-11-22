const Command = require("../../lib/Command.js")
const StorageFacade = require("../../Facades/StorageFacade.js")
const ModuleServiceProvider = require("../../Services/ModuleServiceProvider.js")
const ModulesEmbed = require("../../Embeds/ModuleEmbed.js")
const ModuleHelpEmbed = require("../../Embeds/ModuleHelpEmbed.js")

const modules = ModuleServiceProvider.getModuleNamesSync()

/**
 * Run sub-commands, list the modules no sub-command is given
 */
async function run(args, message) {
    if (args.length === 0) {
        const loaded = ModuleServiceProvider.getLoadedModules().map(entry => entry.name)
        return await message.channel.send(new ModulesEmbed({ available: modules, loaded }))
    }

    if (args[0] === "start") {
        return await startModule(args, message)
    } 

    if (args[0] === "stop") {
        return await stopModule(args, message)
    }

    if (args[0] === "help") {
        return await helpModule(args, message)
    }

    await message.channel.send("Unbekannter Command")
}

/**
 * Start module
 */
async function startModule(args, message) {
    const moduleName = args[1]

    if (!moduleName) {
        return await message.channel.send("Kein Modul angegeben")
    }

    if (!modules.includes(moduleName)) {
        return await message.channel.send("Das Modul existiert nicht")
    }

    if (ModuleServiceProvider.isLoaded(moduleName)) {
        return await message.channel.send("Das Modul ist bereits gestartet")
    }

    // Start the requested module
    let instance
    try {
        instance = await ModuleServiceProvider.startModuleFromMessage(moduleName, message, args.slice(2))
    } catch(error) {
        if (process.env.NODE_ENV === "development") {
            console.error(error)
        }
        
        return await message.channel.send("Das Modul konnte nicht gestartet werden")
    }

    // Store the instance's configuration
    await StorageFacade.setItem(ModuleServiceProvider.storagePrefix + moduleName, instance.getConfig())

    await message.channel.send(`Das Modul '${moduleName}' wurde erfolgreich gestartet`)
}

/**
 * Stop module
 */
async function stopModule(args, message) {
    const moduleName = args[1]

    if (!moduleName) {
        return await message.channel.send("Kein Modul angegeben")
    }

    if (!ModuleServiceProvider.isLoaded(moduleName)) {
        return await message.channel.send("Das Modul ist nicht gestartet")
    }

    await ModuleServiceProvider.stopModule(moduleName)
    await StorageFacade.deleteItem(ModuleServiceProvider.storagePrefix + moduleName)

    await message.channel.send(`Modul '${moduleName}' wurde erfolgreich gestoppt`)
}

/**
 * Send module's help message
 */
async function helpModule(args, message) {
    const moduleName = args[1]

    if (!moduleName) {
        return await message.channel.send("Kein Modul angegeben")
    }

    if (!modules.includes(moduleName)) {
        return await message.channel.send("Das Modul existiert nicht")
    }

    const module = ModuleServiceProvider.getModule(moduleName)
    await message.channel.send(new ModuleHelpEmbed(module))
}

module.exports = new Command(run)
    .setDescription("Zeigt Informationen über die Module an.")
    .setArguments("[start|stop|help] [module]")
    .setPermissions(["MANAGE_GUILD"])