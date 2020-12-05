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

        // The super constructor overrides the "run" method
        this.run = this._run

        /**
         * @type {Map<String, Command>}
         */
        this.commands = {}

        commands.forEach(this.register.bind(this))
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
        const command = this.get(args.shift())

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
    }

    /**
     * Remove a command
     * 
     * @param {Command} command 
     */
    unregister(command) {
        delete this.commands[command.name]
    }

    /**
     * Get a command by matching the name and aliases
     * 
     * @param {String} name
     * @returns {Command}
     */
    get(name) {
        if (this.commands[name]) {
            return this.commands[name]
        }
        
        return Object.values(this.commands).find(cmd => {
            try {
                return cmd.alias.includes(name)
            } catch(error) {
                console.error(error)
                console.log(this.commands, cmd)
            }
        })
    }

    /**
     * Get all commands
     * 
     * @returns {Map<String, Command>}
     */
    getCommands() {
        return this.commands
    }

    /**
     * Get the commands in the form: group: String -> commands: Array<Command>
     * 
     * @returns {Object}
     */
    getGroups() {
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