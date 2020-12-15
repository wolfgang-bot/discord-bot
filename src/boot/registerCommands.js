const glob = require("glob-promise")
const path = require("path")
const CommandRegistry = require("../services/CommandRegistry.js")
const LocaleServiceProvider = require("../services/LocaleServiceProvider.js")

const COMMANDS_DIR = path.join(__dirname, "..", "commands")

async function registerCommands() {
    const commands = await getCommands()

    CommandRegistry.root = new CommandRegistry(commands)
}

async function getCommands() {
    const paths = await glob("?*/*", { cwd: COMMANDS_DIR })

    return paths.map(filepath => {
        const [group, filename] = filepath.split("/")

        const command = require(path.join(COMMANDS_DIR, filepath))

        command.setGroup(group)
        command.setName(filename.replace(".js", ""))
        command.setModule(LocaleServiceProvider.defaultScope)

        return command
    })
}

module.exports = registerCommands