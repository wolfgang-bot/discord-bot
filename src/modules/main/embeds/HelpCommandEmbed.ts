import BaseEmbed from "../../../lib/BaseEmbed"
import Command from "../../../lib/Command"
import LocaleProvider from "../../../services/LocaleProvider"
import CommandGroup from "../../../lib/CommandGroup"
import { makeCodeblock } from "../../../utils"
import SettingsConfig from "../../settings/models/Configuration"

export default class HelpCommandEmbed extends BaseEmbed {
    constructor(settings: SettingsConfig, locale: LocaleProvider, command: Command) {
        super(settings)

        const moduleLocale = locale.scope(command.getModule())

        this.setTitle(locale.translate("embed_help_command_title", command.name))

        if (command.description) {
            this.setDescription(moduleLocale.translate(command.description))
        }

        const subCommands = command instanceof CommandGroup ? `[${Array.from(command.getCommandNames()).join("|")}]` : null

        const args = command.arguments && moduleLocale.translate(command.arguments)

        this.addFields([
            {
                name: locale.translate("embed_help_command_usage"),
                value: makeCodeblock(`${settings.commandPrefix}${command.getCallableName()} ${args || subCommands || ""}`)
            },
            {
                name: locale.translate("embed_help_command_permissions"),
                value: makeCodeblock(command.getPermissions().join("\n") || " ")
            },
            {
                name: locale.translate("embed_help_command_alias"),
                value: makeCodeblock((command.alias || []).join("\n") || " ")
            }
        ])
    }
}
