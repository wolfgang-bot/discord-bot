import Discord from "discord.js"
import DescriptiveObject from "../../../../../lib/DescriptiveObject"
import Command from "../../../../../lib/Command"
import LocaleServiceProvider from "../../../../../services/LocaleServiceProvider"
import Guild from "../../../../../models/Guild"
import Module from "../../../../../models/Module"
import ModuleConfigEmbed from "../../../embeds/ModuleConfigEmbed"
import defaultConfig from "../../../../../config/default"
import { insertIntoDescriptiveObject } from "../../../../../utils"

export default class GetCommand extends Command {
    name = "get"
    description = "command_modules_config_get_desc"
    arguments = "command_modules_config_get_args"
    alias = ["show"]

    async run(message: Discord.Message, args: string[]) {
        const locale = await LocaleServiceProvider.guild(message.guild)

        if (!args[0]) {
            await message.channel.send(locale.translate("error_missing_argument", "module"))
            return
        }

        const module = await Module.findBy("name", args[0])

        if (!module) {
            await message.channel.send(locale.translate("error_module_does_not_exist", args[0]))
            return
        }

        const config = await Guild.config(message.guild)
        const moduleConfig: object = config[args[0]]
        const descriptiveConfig = insertIntoDescriptiveObject(moduleConfig, defaultConfig[args[0]].value as DescriptiveObject)

        await message.channel.send(new ModuleConfigEmbed(config, locale, args[0], descriptiveConfig))
    }
}