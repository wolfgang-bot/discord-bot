const Command = require("../../../../../lib/Command.js")
const LocaleServiceProvider = require("../../../../../services/LocaleServiceProvider.js")
const Guild = require("../../../../../models/Guild.js")
const Module = require("../../../../../models/Module.js")
const ModuleConfigEmbed = require("../../../embeds/ModuleConfigEmbed.js")
const defaultConfig = require("../../../../../config/default.js")
const { insertIntoDescriptiveObject } = require("../../../../../utils")

async function run(message, args) {
    const locale = await LocaleServiceProvider.guild(message.guild)

    if (!args[0]) {
        return await message.channel.send(locale.translate("error_missing_argument", "module"))
    }

    const module = await Module.findBy("name", args[0])

    if (!module) {
        return await message.channel.send(locale.translate("error_module_does_not_exist", args[0]))
    }
    
    const config = await Guild.config(message.guild)
    const moduleConfig = config[args[0]]
    const descriptiveConfig = insertIntoDescriptiveObject(moduleConfig, defaultConfig[args[0]].value)

    await message.channel.send(new ModuleConfigEmbed(config, locale, args[0], descriptiveConfig))
}

module.exports = new Command(run)
    .setName("get")
    .setDescription("command_modules_config_get_desc")
    .setArguments("command_modules_config_get_args")
    .setAlias(["show"])