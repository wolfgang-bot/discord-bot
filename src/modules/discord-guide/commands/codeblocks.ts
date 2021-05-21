import Discord from "discord.js"
import Command from "../../../lib/Command"
import SettingsConfig from "../../settings/models/Configuration"
import ModuleInstance from "../../../models/ModuleInstance"
import LocaleProvider from "../../../services/LocaleProvider"
import CodeblocksEmbed from "../embeds/CodeblocksEmbed"

export default class CodeblocksCommand extends Command {
    name = "codeblocks"
    group = "General"
    description = "command_codeblocks_desc"
    alias = ["cb", "code", "blocks"]

    async run(message: Discord.Message) {
        const settings = await ModuleInstance.config(message.guild, "settings") as SettingsConfig
        const locales = (await LocaleProvider.guild(message.guild)).scope("discord-guide")
        message.channel.send(new CodeblocksEmbed(settings, locales))
    }
}
