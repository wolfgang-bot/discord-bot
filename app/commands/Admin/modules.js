const Command = require("../../lib/Command.js")
const ModuleServiceProvider = require("../../services/ModuleServiceProvider.js")
const ModulesEmbed = require("../../embeds/ModulesEmbed.js")
const ModuleHelpEmbed = require("../../embeds/ModuleHelpEmbed.js")
const ModuleConfigEmbed = require("../../embeds/ModuleConfigEmbed.js")
const Module = require("../../models/Module.js")
const ModuleInstance = require("../../models/ModuleInstance.js")
const Guild = require("../../models/Guild.js")
const defaultConfig = require("../../config/default.json")
const { insertIntoDescriptiveObject } = require("../../utils")

/**
 * Run sub-commands, list the modules no sub-command is given
 */
async function run(message, args) {
    if (args.length === 0) {
        const modules = await Module.getAll()
        const moduleInstances = await ModuleInstance.findAllBy("guild_id", message.guild.id)
        const config = await Guild.config(message.guild)

        moduleInstances.forEach(instance => {
            instance.module = modules.find(module => module.id === instance.module_id)
        })

        return await message.channel.send(new ModulesEmbed(config, { modules, moduleInstances }))
    }
    
    if (!args[1]) {
        return await message.channel.send("Kein Modul angegeben")
    }
    
    const module = await Module.findBy("name", args[1])
    
    if (!module) {
        return await message.channel.send("Das Modul existiert nicht")
    }
    
    if (args[0] === "start") {
        return await startModule(module, message, args)
    } 

    if (args[0] === "stop") {
        return await stopModule(module, message, args)
    }

    if (args[0] === "help") {
        return await helpModule(module, message, args)
    }

    if (args[0] === "config") {
        return await getModuleConfig(module, message, args)
    }

    await message.channel.send("Unbekannter Command")
}

/**
 * Start module
 */
async function startModule(module, message, args) {
    const isLoaded = await ModuleServiceProvider.guild(message.guild).isLoaded(module)

    if (isLoaded) {
        return message.channel.send("Das Modul ist bereits gestartet")
    }

    // Start the requested module
    let instance
    try {
        instance = await ModuleServiceProvider.guild(message.guild).startModule(message.client, module, args.slice(2))
    } catch(error) {
        if (process.env.NODE_ENV === "development") {
            console.error(error)
        }

        const errorMessage = typeof error === "string" ? error : "Serverfehler"
        
        return message.channel.send(`Das Modul konnte nicht gestartet werden\n${errorMessage}`)
    }

    await message.channel.send(`Das Modul '${module.name}' wurde erfolgreich gestartet`)
}

/**
 * Stop module
 */
async function stopModule(module, message, args) {
    const isLoaded = await ModuleServiceProvider.guild(message.guild).isLoaded(module)

    if (!isLoaded) {
        await message.channel.send("Das Modul ist nicht gestartet")
    }

    await ModuleServiceProvider.guild(message.guild).stopModule(module)

    await message.channel.send(`Modul '${module.name}' wurde erfolgreich gestoppt`)
}

/**
 * Return module's help message
 */
async function helpModule(module, message, args) {
    const moduleClass = ModuleServiceProvider.getModule(module)
    const config = await Guild.config(message.guild)
    await message.channel.send(new ModuleHelpEmbed(config, moduleClass))
}

/**
 * Get module config 
 */
async function getModuleConfig(module, message, args) {
    const config = await Guild.config(message.guild)
    const moduleConfig = config[args[1]]
    const descriptiveConfig = insertIntoDescriptiveObject(moduleConfig, defaultConfig[args[1]].value)

    await message.channel.send(new ModuleConfigEmbed(config, args[1], descriptiveConfig))
}

module.exports = new Command(run)
    .setDescription("Zeigt Informationen über die Module an.")
    .setArguments("[start|stop|help|config] [module]")
    .setAlias(["module"])
    .setPermissions(["MANAGE_GUILD"])