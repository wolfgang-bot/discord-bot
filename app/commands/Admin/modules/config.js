const Command = require("../../../lib/Command.js")
const ModuleConfigEmbed = require("../../../embeds/ModuleConfigEmbed.js")
const Guild = require("../../../models/Guild.js")
const defaultConfig = require("../../../config/default.json")
const { insertIntoDescriptiveObject } = require("../../../utils")
const Module = require("../../../models/Module.js")

async function run(message, args) {
    if (!args[0]) {
        return await message.channel.send("Kein Modul angegeben")
    }

    const module = await Module.findBy("name", args[0])

    if (!module) {
        return await message.channel.send("Das Modul existiert nicht")
    }
    
    const config = await Guild.config(message.guild)
    const moduleConfig = config[args[0]]
    const descriptiveConfig = insertIntoDescriptiveObject(moduleConfig, defaultConfig[args[0]].value)

    await message.channel.send(new ModuleConfigEmbed(config, args[0], descriptiveConfig))
}

module.exports = new Command(run)
    .setName("config")
    .setDescription("Zeigt die Konfiguration eines Moduls an.")
    .setArguments("<modul>")