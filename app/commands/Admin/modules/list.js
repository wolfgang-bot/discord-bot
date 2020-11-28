const Command = require("../../../lib/Command.js")
const Module = require("../../../models/Module.js")
const Guild = require("../../../models/Guild.js")
const ModuleInstance = require("../../../models/ModuleInstance.js")
const ModulesEmbed = require("../../../embeds/ModulesEmbed.js")

async function run(message) {
    const modules = await Module.getAll()
    const moduleInstances = await ModuleInstance.findAllBy("guild_id", message.guild.id)
    const config = await Guild.config(message.guild)

    moduleInstances.forEach(instance => {
        instance.module = modules.find(module => module.id === instance.module_id)
    })

    return await message.channel.send(new ModulesEmbed(config, { modules, moduleInstances }))
}

module.exports = new Command(run)
    .setName("list")
    .setDescription("Zeigt eine Liste der verfügbaren sowie der aktiven Module an.")
    .setPermissions(["MANAGE_GUILD"])