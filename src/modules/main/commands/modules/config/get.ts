import Discord from "discord.js"
import DescriptiveObject from "../../../../../lib/DescriptiveObject"
import Command from "../../../../../lib/Command"
import LocaleProvider from "../../../../../services/LocaleProvider"
import Guild from "../../../../../models/Guild"
import Module from "../../../../../models/Module"
import ModuleConfigEmbed from "../../../embeds/ModuleConfigEmbed"
import defaultConfig from "../../../../../config/default"

export default class GetCommand extends Command {
    name = "get"
    description = "command_modules_config_get_desc"
    arguments = "command_modules_config_get_args"
    alias = ["show"]

    async run(message: Discord.Message, args: string[]) {
        const locale = await LocaleProvider.guild(message.guild)

        if (!args[0]) {
            await message.channel.send(locale.translate("error_missing_argument", "module"))
            return
        }

        const module = await Module.findBy("name", args[0])

        if (!module) {
            await message.channel.send(locale.translate("error_module_does_not_exist", args[0]))
            return
        }

        const guildConfig = await Guild.config(message.guild)
        const moduleConfig: object = guildConfig[args[0]]
        const moduleConfigDescriptive = (defaultConfig.value[args[0]] as DescriptiveObject)
            .assignVanillaObject(moduleConfig)

        await message.channel.send(new ModuleConfigEmbed(guildConfig, locale, args[0], moduleConfigDescriptive))
    }
}