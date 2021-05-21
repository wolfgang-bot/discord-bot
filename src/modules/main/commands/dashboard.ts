import Discord from "discord.js"
import Command from "../../../lib/Command"
import DashboardEmbed from "../embeds/DashboardEmbed"
import ModuleInstance from "../../../models/ModuleInstance"
import SettingsConfig from "../../settings/models/Configuration"

export default class DashboardCommand extends Command {
    name = "dashboard"
    group = "General"
    description = "command_dashboard_desc"

    async run(message: Discord.Message) {
        const settings = await ModuleInstance.config(message.guild, "settings") as SettingsConfig
        await message.channel.send(new DashboardEmbed(settings, message.guild))
    }
}
