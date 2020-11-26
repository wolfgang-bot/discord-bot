const glob = require("glob-promise")
const path = require("path")
const CommandRegistry = require("../services/CommandRegistry.js")

const COMMANDS_DIR = path.join(__dirname, "..", "commands")

async function registerCommands() {
    const commands = await getCommands()

    commands.forEach(command => {
        CommandRegistry.register(command)
    })
}

async function getCommands() {
    const paths = await glob("?*/*.js", { cwd: COMMANDS_DIR })

    return paths.map(filepath => {
        const [group, filename] = filepath.split("/")

        const command = require(path.join(COMMANDS_DIR, filepath))

        command.setGroup(group)
        command.setName(filename.replace(".js", ""))

        return command
    })
}

module.exports = registerCommands