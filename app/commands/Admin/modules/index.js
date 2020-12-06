const CommandRegistry = require("../../../services/CommandRegistry.js")

const commands = [
    require("./config"),
    require("./help.js"),
    require("./list.js"),
    require("./start.js"),
    require("./stop.js"),
]

module.exports = new CommandRegistry(commands)
    .setBaseCommand(require("./list.js"))
    .setName("modules")
    .setDescription("Verwaltet die Module.")
    .setPermissions(["MANAGE_GUILD"])