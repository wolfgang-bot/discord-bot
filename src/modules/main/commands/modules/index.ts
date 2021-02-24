import Discord from "discord.js"
import { CommandGroup  } from "@personal-discord-bot/shared/dist/command"
import ConfigCommand from "./config"
import HelpCommand from "./help"
import ListCommand from "./list"
import StartCommand from "./start"
import StopCommand from "./stop"
import RestartCommand from "./restart"

export default class ModulesCommandGroup extends CommandGroup {
    name = "modules"
    alias = ["module"]
    group = "Admin"
    description = "command_modules_desc"
    permissions: Discord.PermissionString[] = ["MANAGE_GUILD"]
    defaultCommand = new ListCommand()

    constructor() {
        super([
            new ConfigCommand(),
            new HelpCommand(),
            new ListCommand(),
            new StartCommand(),
            new StopCommand(),
            new RestartCommand()
        ])
    }
}
