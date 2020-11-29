const CommandRegistry = require("../../../../services/CommandRegistry.js")

const commands = [
    require("./get.js"),
    require("./set.js")
]

module.exports = new CommandRegistry(commands)
    .setName("config")
    .setDescription("Vewaltet die Modul-Konfigurationen.")