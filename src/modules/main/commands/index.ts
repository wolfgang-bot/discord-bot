import CommandGroup from "../../../lib/CommandGroup"
import HelpCommand from "./help"
import DashboardCommand from "./dashboard"

export default class RootCommandGroup extends CommandGroup {
    constructor() {
        const commands = [
            new HelpCommand(),
            new DashboardCommand()
        ]

        commands.forEach(command => command.module = "main")

        super(commands)
    }
}
