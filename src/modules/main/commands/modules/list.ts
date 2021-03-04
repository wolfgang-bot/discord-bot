import Discord from "discord.js"
import Command from "../../../../lib/Command"
import LocaleProvider from "../../../../services/LocaleProvider"
import ModulesEmbed from "../../embeds/ModulesEmbed"
import Guild from "../../../../models/Guild"
import SettingsConfig from "../../../settings/models/Configuration"
import ModuleInstance from "../../../../models/ModuleInstance"

export default class ListCommand extends Command {
    name = "list"
    description = "command_modules_list_desc"

    async run(message: Discord.Message) {
        const locale = await LocaleProvider.guild(message.guild)

        const settings = await ModuleInstance.config(message.guild, "settings") as SettingsConfig
        const guild = await Guild.findBy("id", message.guild.id) as Guild

        await message.channel.send(new ModulesEmbed(settings, locale, { guild }))
    }
}
