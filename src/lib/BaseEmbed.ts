import { MessageEmbed } from "discord.js"
import SettingsConfig from "../modules/settings/models/Configuration"

class BaseEmbed extends MessageEmbed {
    constructor(settings: SettingsConfig) {
        super()

        this.setColor(settings.colorPrimary)
    }
}

export default BaseEmbed
