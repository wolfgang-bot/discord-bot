import * as Discord from "discord.js"
import Module from "../../lib/Module"
import Context from "../../lib/Context"
import CommandRegistry from "../../services/CommandRegistry"
import EventManager from "./managers/EventManager"

const commands = [
    require("./commands/help.js"),
    require("./commands/locale"),
    require("./commands/modules"),
]

commands.forEach(command => command.setModule("main"))

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