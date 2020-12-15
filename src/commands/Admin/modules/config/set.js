const Command = require("../../../../lib/Command.js")
const LocaleServiceProvider = require("../../../../services/LocaleServiceProvider.js")
const Guild = require("../../../../models/Guild.js")
const Module = require("../../../../models/Module.js")
const defaultConfig = require("../../../../config/default.js")
const { convertDatatype } = require("../../../../utils")

/**
 * Update the configuration of a module for the message's guild by a given
 * key - value pair.
 * 
 * @param {Discord.Message} message 
 * @param {Array<String>} args 
 */
async function run(message, args) {
    const locale = await LocaleServiceProvider.guild(message.guild)

    const [moduleName, attribute, value] = args

    /**
     * Validate arguments
     */
    if (!moduleName) {
        return await message.channel.send(locale.translate("error_missing_argument", "module"))
    }

    const module = await Module.findBy("name", moduleName)

    if (!module) {
        return await message.channel.send(locale.translate("error_module_does_not_exist", moduleName))
    }

    const guild = await Guild.findBy("id", message.guild.id)
    const moduleConfig = guild.config[moduleName]

    if (!(attribute in moduleConfig)) {
        return await message.channel.send(locale.translate("error_key_does_not_exist", attribute))
    }

    /**
     * Format value to match the default value's datatype
     */
    let formattedValue
    try {
        const defaultValue = defaultConfig[moduleName].value[attribute].value
        formattedValue = convertDatatype(value, defaultValue.constructor.name)
    } catch(error) {
        if (process.env.NODE_ENV === "development") {
            console.error(error)
        }

        const errorMessage = typeof error === "string" ? error : locale.translate("server_error")

        return await message.channel.send(locale.translate("failed", errorMessage))
    }

    /**
     * Set the new value and update guild
     */
    guild.config[moduleName][attribute] = formattedValue
    await guild.update()

    await message.channel.send(locale.translate("success"))
}

module.exports = new Command(run)
    .setName("set")
    .setDescription("command_modules_config_set_desc")
    .setArguments("command_modules_config_set_args")
