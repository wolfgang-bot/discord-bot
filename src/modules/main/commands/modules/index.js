const CommandRegistry = require("../../../../services/CommandRegistry.js")

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
    .setGroup("Admin")
    .setDescription("command_modules_desc")
    .setPermissions(["MANAGE_GUILD"])