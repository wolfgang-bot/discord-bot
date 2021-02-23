import CommandGroup from "@personal-discord-bot/shared/dist/command/CommandGroup"
import GetCommand from "./get"
import SetCommand from "./set" 

export default class ConfigCommandGroup extends CommandGroup {
    name = "config"
    description = "command_modules_config_desc"

    constructor() {
        super([
            new GetCommand(),
            new SetCommand
        ])
    }
}
