class Command {
    constructor(run) {
        this.run = run

        this.name = null
        this.group = null
        this.parent = null
        this.description = null
        this.arguments = null
        this.module = null
        this.alias = []
        this.permissions = []
    }

    /**
     * Get the command required to call this command by traversing the command
     * tree and concatenating the command names.
     * 
     * @returns {String}
     */
    getCallableName() {
        const names = []

        let command = this
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
     * 
     * @returns {Array<String>}
     */
    getPermissions() {
        const permissions = []

        let command = this
        while (command) {
            permissions.push(...command.permissions)
            command = command.parent
        }
        
        return permissions
    }

    /**
     * Get the module this command demands by traversing the command tree.
     * 
     * @returns {String}
     */
    getModule() {
        if (this.module) {
            return this.module
        }

        return this.parent.getModule()
    }

    /**
     * @param {String} name
     */
    setName(name) {
        this.name = name
        return this
    }
    
    /**
     * @param {String} group
     */
    setGroup(group) {
        this.group = group
        return this
    }
    
    /**
    * @param {Command} parent
     */
    setParent(parent) {
        this.parent = parent
        return this
    }
    
    /**
    * @param {String} description
     */
    setDescription(description) {
        this.description = description
        return this
    }
    
    /**
    * @param {Array<String>} args
     */
    setArguments(args) {
        this.arguments = args
        return this
    }
    
    /**
    * @param {Array<String>} alias
     */
    setAlias(alias) {
        this.alias = alias
        return this
    }
    
    /**
    * @param {Array<String>} permissions
     */
    setPermissions(permissions) {
        this.permissions = permissions
        return this
    }

    /**
     * @param {String} module
     */
    setModule(module) {
        this.module = module
    }
}

module.exports = Command