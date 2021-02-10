import Discord from "discord.js"
import Module from "../../lib/Module"
import Context from "../../lib/Context"
import { module, global } from "../../lib/decorators"
import CommandRegistry from "../../services/CommandRegistry"
import EventManager from "./managers/EventManager"
import HelpCommand from "./commands/help"
import LocaleCommand from "./commands/locale"
import ModuleCommand from "./commands/modules"

const commands = [
    new HelpCommand(),
    new LocaleCommand(),
    new ModuleCommand()
]

commands.forEach(command => command.module = "main")

@module({
    name: "main"
})
@global
class MainModule extends Module {
    client: Discord.Client
    eventManager: EventManager

    constructor(context: Context) {
        super(context)
        this.eventManager = new EventManager(this.context)
    }

    async start() {
        CommandRegistry.root = new CommandRegistry(commands)
        this.eventManager.init()
    }
}

export default MainModule