const Command = require("../../../lib/Command.js")
const LocaleServiceProvider = require("../../../services/LocaleServiceProvider.js")
const Module = require("../../../models/Module.js")
const Guild = require("../../../models/Guild.js")
const ModuleInstance = require("../../../models/ModuleInstance.js")
const ModulesEmbed = require("../../../embeds/ModulesEmbed.js")

async function run(message) {
    const locale = await LocaleServiceProvider.guild(message.guild)

    const modules = await Module.getAll()
    const moduleInstances = await ModuleInstance.findAllBy("guild_id", message.guild.id)
    const config = await Guild.config(message.guild)
    const guild = await Guild.findBy("id", message.guild.id)

    moduleInstances.forEach(instance => {
        instance.module = modules.find(module => module.id === instance.module_id)
    })

    return await message.channel.send(new ModulesEmbed(config, locale,{ guild, modules, moduleInstances }))
}

module.exports = new Command(run)
    .setName("list")
    .setDescription("command_modules_list_desc")