import Discord from "discord.js"
import Command from "../../../../../lib/Command"
import LocaleServiceProvider from "../../../../../services/LocaleServiceProvider"
import Guild from "../../../../../models/Guild"
import Module from "../../../../../models/Module"
import defaultConfig from "../../../../../config/default"
import { convertDatatype } from "../../../../../utils"

export default class SetCommand extends Command {
    name = "set"
    description = "command_modules_config_set_desc"
    arguments = "command_modules_config_set_args"

    async run(message: Discord.Message, args: string[]) {
        const locale = await LocaleServiceProvider.guild(message.guild)

        const [moduleName, attribute, value] = args

        /**
         * Validate arguments
         */
        if (!moduleName) {
            await message.channel.send(locale.translate("error_missing_argument", "module"))
            return
        }

        const module = await Module.findBy("name", moduleName)

        if (!module) {
            await message.channel.send(locale.translate("error_module_does_not_exist", moduleName))
            return
        }

        const guild = await Guild.findBy("id", message.guild.id) as Guild
        const moduleConfig = guild.config[moduleName]

        if (!(attribute in moduleConfig)) {
            await message.channel.send(locale.translate("error_key_does_not_exist", attribute))
            return
        }

        /**
         * Format value to match the default value's datatype
         */
        let formattedValue
        try {
            const defaultValue = defaultConfig[moduleName].value[attribute].value
            formattedValue = convertDatatype(value, defaultValue.constructor.name)
        } catch (error) {
            if (process.env.NODE_ENV === "development") {
                console.error(error)
            }

            const errorMessage = typeof error === "string" ? error : locale.translate("server_error")

            await message.channel.send(locale.translate("failed", errorMessage))
            return
        }

        /**
         * Set the new value and update guild
         */
        guild.config[moduleName][attribute] = formattedValue
        await guild.update()

        await message.channel.send(locale.translate("success"))
    }
}