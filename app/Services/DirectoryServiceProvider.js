const fs = require("fs")
const path = require("path")

const COMMANDS_DIR = path.join(__dirname, "..", "Commands")

class DirectoryServiceProvider {
    /**
     * Parse the commands from the given files array
     */
    static parseCommandsDir(dir) {
        return dir.filter(filename => filename !== "index.js").map(filename => {
            const command = require(path.join(COMMANDS_DIR, filename))
            command.setName(filename.replace(".js", ""))
            return command
        })
    }

    /**
     * Get all commands from the "./Commands" directory
     */
    static async getCommands() {
        const dir = await fs.promises.readdir(COMMANDS_DIR)
        return DirectoryServiceProvider.parseCommandsDir(dir)
    }

    /**
     * Same as "getCommands", but synchronous
     */
    static getCommandsSync() {
        return DirectoryServiceProvider.parseCommandsDir(fs.readdirSync(COMMANDS_DIR))
    }
}

module.exports = DirectoryServiceProvider