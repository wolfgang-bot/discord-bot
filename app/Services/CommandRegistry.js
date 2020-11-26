class CommandRegistry {
    static commands = {} // name: String -> command: Command Map

    /**
     * Add a command
     * 
     * @param {Command} command 
     */
    static register(command) {
        this.commands[command.name] = command
    }

    /**
     * Remove a command
     * 
     * @param {Command} command 
     */
    static unregister(command) {
        delete this.commands[command.name]
    }

    /**
     * Get a command by matching the name and aliases
     * 
     * @param {String} name
     * @returns {Command}
     */
    static get(name) {
        if (this.commands[name]) {
            return this.commands[name]
        }

        return Object.values(this.commands).find(cmd => (cmd.alias || []).includes(name))
    }

    /**
     * Get all commands as an array
     * 
     * @returns {Array<Command>}
     */
    static getAll() {
        return Object.values(this.commands)
    }

    /**
     * Get the commands in the form: group: String -> commands: Array<Command>
     * 
     * @returns {Object}
     */
    static getGroups() {
        const groups = {}

        Object.values(this.commands).forEach(command => {
            if (!groups[command.group]) {
                groups[command.group] = []
            }

            groups[command.group].push(command)
        })

        return groups
    }
}

module.exports = CommandRegistry