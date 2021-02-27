import Discord from "discord.js"
import LocaleProvider from "../services/LocaleProvider"

abstract class Command {
    abstract name: string
    group: string
    description: string
    arguments: string
    alias: string[]
    permissions: Discord.PermissionString[]
    parent: Command
    module: string

    abstract run(message: Discord.Message, args: string[]): Promise<void>

    /**
     * Get the command required to call this command by traversing the command
     * tree and concatenating the command names
     */
    getCallableName() {
        const names: string[] = []

        let command: Command = this
        while (command) {
            if (command.name) {
                names.unshift(command.name)
            }
            command = command.parent
        }

        return names.join(" ")
    }

    /**
     * Determine the required permissions to run this command by traversing
     * the command tree
     */
    getPermissions() {
        const permissions: Discord.PermissionString[] = []

        let command: Command = this
        while (command) {
            if (command.permissions) {
                permissions.push(...command.permissions)
            }
            command = command.parent
        }
        
        return permissions
    }

    /**
     * Get the module this command demands by traversing the command tree
     */
    getModule(): string {
        if (this.module) {
            return this.module
        }

        return this.parent.getModule()
    }T

    /**
     * Get the message which a user has to type into the chat to execute this command
     */
    getUsage() {
        const args = this.arguments &&
            new LocaleProvider().scope(this.module).translate(this.arguments)
        return `${process.env.DISCORD_BOT_PREFIX}${this.getCallableName()} ${args || ""}`.trim()
    }

    toJSON() {
        const locale = new LocaleProvider().scope(this.module)

        return {
            name: this.name,
            callableName: this.getCallableName(),
            group: this.group,
            module: this.getModule(),
            description: this.description && locale.translate(this.description),
            usage: this.getUsage()
        }
    }
}

export default Command
