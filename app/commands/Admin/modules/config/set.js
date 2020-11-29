const Command = require("../../../../lib/Command.js")
const Guild = require("../../../../models/Guild.js")
const Module = require("../../../../models/Module.js")
const defaultConfig = require("../../../../config/default.json")
const { convertDatatype } = require("../../../../utils")

/**
 * Update the configuration of a module for the message's guild by a given
 * key - value pair.
 * 
 * @param {Discord.Message} message 
 * @param {Array<String>} args 
 */
async function run(message, args) {
    const [moduleName, attribute, value] = args

    /**
     * Validate arguments
     */
    if (!moduleName) {
        return await message.channel.send("Kein Modul angegeben")
    }

    const module = await Module.findBy("name", moduleName)

    if (!module) {
        return await message.channel.send("Das Modul existiert nicht")
    }

    const guild = await Guild.findBy("id", message.guild.id)
    const moduleConfig = guild.config[moduleName]

    if (!(attribute in moduleConfig)) {
        return await message.channel.send(`Der Schlüssel '${attribute}' existiert nicht`)
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
            console.log(error)
        }

        const errorMessage = typeof error === "string" ? error : "Serverfehler"

        return await message.channel.send(errorMessage)
    }

    /**
     * Set the new value and update guild
     */
    guild.config[moduleName][attribute] = formattedValue
    await guild.update()

    await message.channel.send(`Erfolgreiche Zuweisung von '${formattedValue}' auf '${attribute}'`)
}

module.exports = new Command(run)
    .setName("set")
    .setDescription("Ändert die Konfiguration eines Moduls.")
    .setArguments("<modul> <key> <wert>")
