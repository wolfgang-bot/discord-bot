import Discord from "discord.js"

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
            permissions.push(...command.permissions)
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
    }
}

export default Command