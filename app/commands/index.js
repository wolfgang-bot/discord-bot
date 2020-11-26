const CommandRegistry = require("../services/CommandRegistry.js")

function run(name, message, args) {
    const command = CommandRegistry.get(name)

    if (!command) {
        return message.channel.send("Unbekannter Command")
    }

    // Check if the user has all permissions to run this command
    if (command.permissions) {
        for (let permission of command.permissions) {
            if (!message.member.hasPermission(permission)) {
                const requiredPerms = command.permissions.map(perm => `'${perm}'`).join(", ")
                return message.channel.send(`Unzureichende Rechte. Der Command benötigt: ${requiredPerms}.`)
            }
        }
    }

    command.run(message, args)
}

module.exports = run