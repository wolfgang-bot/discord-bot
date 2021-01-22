class Command {
    run: Function
    name: string
    group: string
    parent: Command
    description: string
    arguments: string[] = []
    module: string
    alias: string[] = []
    permissions: string[] = []

    constructor(run: Function) {
        this.run = run
    }

    /**
     * Get the command required to call this command by traversing the command
     * tree and concatenating the command names.
     */
    getCallableName(): string {
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
     * the command tree.
     */
    getPermissions(): string[] {
        const permissions: string[] = []

        let command: Command = this
        while (command) {
            permissions.push(...command.permissions)
            command = command.parent
        }
        
        return permissions
    }

    /**
     * Get the module this command demands by traversing the command tree.
     */
    getModule(): string {
        if (this.module) {
            return this.module
        }

        return this.parent.getModule()
    }

    setName(name: string) {
        this.name = name
        return this
    }
    
    setGroup(group: string) {
        this.group = group
        return this
    }
    
    setParent(parent: Command) {
        this.parent = parent
        return this
    }
    
    setDescription(description: string) {
        this.description = description
        return this
    }
    
    setArguments(args: string[]) {
        this.arguments = args
        return this
    }
    
    setAlias(alias: string[]) {
        this.alias = alias
        return this
    }
    
    setPermissions(permissions: string[]) {
        this.permissions = permissions
        return this
    }

    setModule(module: string) {
        this.module = module
    }
}

export default Command