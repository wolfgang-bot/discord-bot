const Command = require("../lib/Command.js")
const { parseArguments } = require("../utils")

class CommandRegistry extends Command {
    /**
     * Root registry -> May have child registries
     * 
     * @type {CommandRegistry}
     */
    static root = null

    constructor(commands = []) {
        super()

        this.baseCommand = null

        // The super constructor overrides the "run" method
        this.run = this._run

        /**
         * @type {Map<String, Command>}
         */
        this.commands = {}
        this.commandNames = new Set()

        commands.forEach(this.register.bind(this))
    }

    /**
     * Set the command which will be executed when no sub-command is specified
     * 
     * @param {Command} command 
     * @returns {CommandRegistry} Enable method chaining
     */
    setBaseCommand(command) {
        this.baseCommand = command
        return this
    }

    /**
     * Run a command by parsing the message's content
     * 
     * @param {Discord.Message} message
     */
    async _run(message, args) {
        if (!message.guild) {
            throw "Commands sind nur auf Servern verfügbar."
        }

        // Parse the arguments and get command
        if (!args) {
            args = parseArguments(message.content)
        }
        const command = args.length > 0 ? this.get(args.shift()) : this.baseCommand

        if (!command) {
            throw "Unbekannter Command"
        }

        // Check if the user has all permissions to run this command
        if (!message.member.hasPermission(command.permissions)) {
            const requiredPerms = command.permissions.map(perm => `'${perm}'`).join(", ")
            throw `Unzureichende Rechte. Der Command benötigt: ${requiredPerms}.`
        }

        await command.run(message, args)
    }

    /**
     * Add a command
     * 
     * @param {Command} command 
     */
    register(command) {
        command.setParent(this)

        this.commands[command.name] = command
        command.alias.forEach(alias => this.commands[alias] = command)

        this.commandNames.add(command.name)
    }

    /**
     * Remove a command
     * 
     * @param {Command} command 
     */
    unregister(command) {
        delete this.commands[command.name]
        command.alias.forEach(alias => delete this.commands[alias])

        this.commandNames.delete(command.name)
    }

    /**
     * Get a command by name or alias
     * 
     * @param {String} name
     * @returns {Command}
     */
    get(key) {
        return this.commands[key]
    }

    /**
     * Get all command names
     * 
     * @returns {Set<String>}
     */
    getCommandNames() {
        return this.commandNames
    }

    /**
     * Get the commands in the form: group: String -> commands: Array<Command>
     * 
     * @returns {Object}
     */
    getGroups() {
        const groups = {}

        this.commandNames.forEach(name => {
            const command = this.commands[name]
            
            if (!groups[command.group]) {
                groups[command.group] = []
            }

            groups[command.group].push(command)
        })

        return groups
    }
}

module.exports = CommandRegistry