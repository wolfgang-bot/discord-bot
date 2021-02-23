import CommandGroup from "../../../lib/CommandGroup"
import HelpCommand from "./help"
import LocaleCommand from "./locale"
import ModuleCommand from "./modules"

export default class RootCommandGroup extends CommandGroup {
    constructor() {
        const commands = [
            new HelpCommand(),
            new LocaleCommand(),
            new ModuleCommand()
        ]

        commands.forEach(command => command.module = "main")

        super(commands)
    }
}