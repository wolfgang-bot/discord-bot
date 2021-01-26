import * as Discord from "discord.js"
import Command from "../lib/Command"
import LocaleServiceProvider from "./LocaleServiceProvider"
import { parseArguments } from "../utils"

export type CommandMap = {
    [key: string]: Command
}

export type CommandGroupMap = {
    [group: string]: Command[]
}

class CommandRegistry extends Command {
    static root: CommandRegistry = null
    defaultCommand: Command
    commands: CommandMap = {}
    commandNames: Set<string> = new Set()
    name = null
    group = null

    constructor(commands: Command[] = []) {
        super()
        commands.forEach(this.register.bind(this))
    }

    /**
     * Run a command by parsing the message's content
     */
    async run(message: Discord.Message, args?: string[]) {
        if (!message.guild) {
            throw "Commands are only available on servers"
        }
        
        const locale = await LocaleServiceProvider.guild(message.guild)

        // Parse the arguments and get command
        if (!args) {
            args = parseArguments(message.content)
        }

        const commandName = args.shift()
        const command = commandName ? this.get(commandName) : this.defaultCommand

        if (!command) {
            throw locale.translate("error_command_does_not_exist", commandName)
        }

        // Check if the user has all permissions to run this command
        if (!message.member.hasPermission(command.permissions)) {
            const requiredPerms = command.permissions.map(perm => `'${perm}'`).join(", ")
            throw locale.translate("error_insufficient_permissions", requiredPerms)
        }

        await command.run(message, args)
    }

    /**
     * Register a command. Sets the parent of the given command to this.
     */
    register(command: Command) {
        command.parent = this

        this.commands[command.name] = command
        command.alias?.forEach(alias => this.commands[alias] = command)

        this.commandNames.add(command.name)
    }

    /**
     * Unregisters a command
     */
    unregister(command: Command) {
        delete this.commands[command.name]
        command.alias.forEach(alias => delete this.commands[alias])

        this.commandNames.delete(command.name)
    }

    /**
     * Get a command by name or alias
     */
    get(key: string) {
        return this.commands[key]
    }

    /**
     * Get all command names
     */
    getCommandNames() {
        return this.commandNames
    }

    /**
     * Get all commands mapped by their groups
     */
    getGroups() {
        const groups: CommandGroupMap = {}

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

export default CommandRegistry