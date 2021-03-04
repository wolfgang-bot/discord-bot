import BaseEmbed from "../../../lib/BaseEmbed"
import LocaleProvider from "../../../services/LocaleProvider"
import { CommandGroupMap } from "../../../lib/CommandGroup"
import { makeCodeblock } from "../../../utils"
import SettingsConfig from "../../settings/models/Configuration"

export default class HelpEmbed extends BaseEmbed {
    constructor(settings: SettingsConfig, locale: LocaleProvider, groups: CommandGroupMap) {
        super(settings)

        this.setTitle(locale.translate("embed_help_title"))
            .setDescription(locale.translate("embed_help_desc", settings.commandPrefix))

        Object.entries(groups).forEach(([group, commands]) => {
            const commandNames = commands.map(command => command.name).join("\n")
            this.addField(group, makeCodeblock(commandNames), true)
        })
    }
}
