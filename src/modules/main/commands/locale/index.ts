import * as Discord from "discord.js"
import CommandRegistry from "../../../../services/CommandRegistry"
import GetCommand from "./get"
import SetCommand from "./set"

export default class LocaleCommandGroup extends CommandRegistry {
    name = "locale"
    group = "Admin"
    description = "command_locale_desc"
    permissions: Discord.PermissionString[] = ["MANAGE_GUILD"]
    alias = ["language", "lang"]
    defaultCommand = new GetCommand()

    constructor() {
        super([
            new GetCommand(),
            new SetCommand()
        ])
    }
}