const Command = require("../../../lib/Command.js")
const Module = require("../../../models/Module.js")
const ModuleServiceProvider = require("../../../services/ModuleServiceProvider.js")

async function run(message, args) {
    if (!args[0]) {
        return await message.channel.send("Kein Modul angegeben")
    }

    const module = await Module.findBy("name", args[0])

    if (!module) {
        return await message.channel.send("Das Modul existiert nicht")
    }
    
    const isLoaded = await ModuleServiceProvider.guild(message.guild).isLoaded(module)

    if (isLoaded) {
        return message.channel.send("Das Modul ist bereits gestartet")
    }

    // Start the requested module
    let instance
    try {
        instance = await ModuleServiceProvider.guild(message.guild).startModule(message.client, module, args.slice(1))
    } catch (error) {
        if (process.env.NODE_ENV === "development") {
            console.error(error)
        }

        const errorMessage = typeof error === "string" ? error : "Serverfehler"

        return message.channel.send(`Das Modul konnte nicht gestartet werden\n${errorMessage}`)
    }

    await message.channel.send(`Das Modul '${module.name}' wurde erfolgreich gestartet`)
}

module.exports = new Command(run)
    .setName("start")
    .setDescription("Startet ein Modul.")
    .setArguments("<modul> [parameter, ...]")