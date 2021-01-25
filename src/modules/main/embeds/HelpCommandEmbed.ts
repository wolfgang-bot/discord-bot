import BaseEmbed from "../../../lib/BaseEmbed"
import Command from "../../../lib/Command"
import LocaleServiceProvider from "../../../services/LocaleServiceProvider"
import CommandRegistry from "../../../services/CommandRegistry"
import { makeCodeblock } from "../../../utils"

export default class HelpCommandEmbed extends BaseEmbed {
    constructor(config, locale: LocaleServiceProvider, command: Command) {
        super(config)

        const moduleLocale = locale.scope(command.getModule())

        this.setTitle(locale.translate("embed_help_command_title", command.name))

        if (command.description) {
            this.setDescription(moduleLocale.translate(command.description))
        }

        const subCommands = command instanceof CommandRegistry ? `[${Array.from(command.getCommandNames()).join("|")}]` : null

        const args = command.arguments && moduleLocale.translate(command.arguments)

        this.addFields([
            {
                name: locale.translate("embed_help_command_usage"),
                value: makeCodeblock(`${process.env.DISCORD_BOT_PREFIX}${command.getCallableName()} ${args || subCommands || ""}`)
            },
            {
                name: locale.translate("embed_help_command_permissions"),
                value: makeCodeblock(command.getPermissions().join("\n") || " ")
            },
            {
                name: locale.translate("embed_help_command_alias"),
                value: makeCodeblock(command.alias.join("\n") || " ")
            }
        ])
    }
}