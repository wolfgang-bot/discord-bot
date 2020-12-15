const EventManager = require("./managers/EventManager.js")
const CommandRegistry = require("../../services/CommandRegistry.js")

const commands = [
    require("./commands/help.js"),
    require("./commands/locale"),
    require("./commands/modules"),
]

commands.forEach(command => command.setModule("main"))

class Module {
    constructor({ client }) {
        this.client = client
        this.eventManager = new EventManager({ client })
    }

    async start() {
        CommandRegistry.root = new CommandRegistry(commands)

        this.eventManager.init()
    }
}

module.exports = Module