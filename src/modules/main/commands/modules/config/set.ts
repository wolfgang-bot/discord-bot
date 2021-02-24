import Discord from "discord.js"
import { Command } from "@personal-discord-bot/shared/dist/command"
import { LocaleProvider } from "@personal-discord-bot/shared/dist"
import { Guild, Module } from "@personal-discord-bot/shared/dist/models"
import defaultConfig from "../../../../../config/default"
import { convertDatatype } from "@personal-discord-bot/shared/dist/utils"

export default class SetCommand extends Command {
    name = "set"
    description = "command_modules_config_set_desc"
    arguments = "command_modules_config_set_args"

    async run(message: Discord.Message, args: string[]) {
        const locale = await LocaleProvider.guild(message.guild)

        const [moduleKey, attribute, value] = args

        /**
         * Validate arguments
         */
        if (!moduleKey) {
            await message.channel.send(locale.translate("error_missing_argument", "module"))
            return
        }

        const module = await Module.findBy("key", moduleKey)

        if (!module) {
            await message.channel.send(locale.translate("error_module_does_not_exist", moduleKey))
            return
        }

        const guild = await Guild.findBy("id", message.guild.id) as Guild
        const moduleConfig = guild.config[moduleKey]

        if (!(attribute in moduleConfig)) {
            await message.channel.send(locale.translate("error_key_does_not_exist", attribute))
            return
        }

        /**
         * Format value to match the default value's datatype
         */
        let formattedValue: any
        try {
            const defaultValue = defaultConfig.value[moduleKey].value[attribute].value
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
        guild.config[moduleKey][attribute] = formattedValue
        await guild.update()

        await message.channel.send(locale.translate("success"))
    }
}
