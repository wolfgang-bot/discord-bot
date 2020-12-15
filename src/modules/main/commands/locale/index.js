const CommandRegistry = require("../../../../services/CommandRegistry.js")

const commands = [
    require("./get.js"),
    require("./set.js")
]

module.exports = new CommandRegistry(commands)
    .setBaseCommand(require("./get.js"))
    .setName("locale")
    .setGroup("Admin")
    .setDescription("command_locale_desc")
    .setPermissions(["MANAGE_GUILD"])
    .setAlias(["language", "lang"])