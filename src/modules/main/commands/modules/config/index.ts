import CommandRegistry from "../../../../../services/CommandRegistry"
import GetCommand from "./get"
import SetCommand from "./set" 

export default class ConfigCommandGroup extends CommandRegistry {
    name = "config"
    description = "command_modules_config_desc"

    constructor() {
        super([
            new GetCommand(),
            new SetCommand
        ])
    }
}