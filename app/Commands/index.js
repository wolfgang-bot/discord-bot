const DirectoryServiceProvider = require("../Services/DirectoryServiceProvider.js")

const commands = DirectoryServiceProvider.getCommandsSync()

function run(name, args, message) {
    // Find the requested command by matching the command name and aliases
    const command = commands.find(cmd => cmd.name === name || (cmd.alias || []).includes(name))

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

    command.run(args, message)
}

module.exports = run