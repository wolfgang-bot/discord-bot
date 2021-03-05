import BaseEmbed from "../../../lib/BaseEmbed"
import SettingsConfig from "../../settings/models/Configuration"

export default class MyEmbed extends BaseEmbed {
    constructor(settings: SettingsConfig) {
        super(settings)

        this.setTitle("Embed")
    }
}
