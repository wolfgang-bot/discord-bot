import Discord from "discord.js"
import BaseEmbed from "../../../lib/BaseEmbed"
import SettingsConfig from "../../settings/models/Configuration"
import { makeURL } from "../../../utils"

export default class DashboardEmbed extends BaseEmbed {
    constructor(settings: SettingsConfig, guild: Discord.Guild) {
        super(settings)

        const url = makeURL(`/dashboard/guild/${guild.id}/`)

        this.setTitle("Dashboard")
            .setDescription(`[Open in browser](${url})`)
    }
}
