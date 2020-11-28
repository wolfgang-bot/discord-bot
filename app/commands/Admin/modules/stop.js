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

    if (!isLoaded) {
        await message.channel.send("Das Modul ist nicht gestartet")
    }

    await ModuleServiceProvider.guild(message.guild).stopModule(module)

    await message.channel.send(`Modul '${module.name}' wurde erfolgreich gestoppt`)
}

module.exports = new Command(run)
    .setName("stop")
    .setDescription("Stoppt ein Modul.")
    .setArguments("<modul>")
    .setPermissions(["MANAGE_GUILD"])