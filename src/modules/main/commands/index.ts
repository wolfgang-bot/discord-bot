import CommandGroup from "../../../lib/CommandGroup"
import HelpCommand from "./help"

export default class RootCommandGroup extends CommandGroup {
    constructor() {
        const commands = [
            new HelpCommand()
        ]

        commands.forEach(command => command.module = "main")

        super(commands)
    }
}
