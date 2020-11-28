const Command = require("../../../lib/Command.js")
const ModuleServiceProvider = require("../../../services/ModuleServiceProvider.js")
const ModuleHelpEmbed = require("../../../embeds/ModuleHelpEmbed.js")
const Module = require("../../../models/Module.js")
const Guild = require("../../../models/Guild.js")

async function run(message, args) {
    if (!args[0]) {
        return await message.channel.send("Kein Modul angegeben")
    }

    const module = await Module.findBy("name", args[0])

    if (!module) {
        return await message.channel.send("Das Modul existiert nicht")
    }

    const moduleClass = ModuleServiceProvider.getModule(module)
    const config = await Guild.config(message.guild)
    await message.channel.send(new ModuleHelpEmbed(config, moduleClass))
}

module.exports = new Command(run)
    .setName("help")
    .setDescription("Zeigt Informationen über ein Module an.")
    .setArguments("<modul>")