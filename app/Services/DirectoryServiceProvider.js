const glob = require("glob")
const path = require("path")

const COMMANDS_DIR = path.join(__dirname, "..", "Commands")

const globAsync = (pattern, config) => new Promise((resolve, reject) => {
    glob(pattern, config, (error, matches) => {
        if (error) reject(error)
        else resolve(matches)
    })
})

class DirectoryServiceProvider {
    /**
     * Parse the commands from the given files array
     */
    static parseCommandsDir(paths) {
        return paths.map(filepath => {
            const [group, filename] = filepath.split("/")
            const command = require(path.join(COMMANDS_DIR, filepath))
            command.setGroup(group)
            command.setName(filename.replace(".js", ""))
            return command
        })
    }

    /**
     * Get all commands from the "app/Commands" directory
     */
    static async getCommands() {
        const paths = await globAsync("?*/*.js", { cwd: COMMANDS_DIR })
        return DirectoryServiceProvider.parseCommandsDir(paths)
    }

    /**
     * Same as "getCommands", but synchronous
     */
    static getCommandsSync() {
        const paths = glob.sync("?*/*.js", { cwd: COMMANDS_DIR })
        return DirectoryServiceProvider.parseCommandsDir(paths)
    }
}

module.exports = DirectoryServiceProvider