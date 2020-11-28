const CommandRegistry = require("../../../services/CommandRegistry.js")

const commands = [
    require("./config.js"),
    require("./help.js"),
    require("./list.js"),
    require("./start.js"),
    require("./stop.js"),
]

module.exports = new CommandRegistry(commands)
    .setName("modules")
    .setDescription("Verwaltet die Module.")
    .setArguments("[config|help|list|start|stop]")