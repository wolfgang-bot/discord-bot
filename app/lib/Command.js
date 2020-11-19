class Command {
    constructor(run) {
        this.run = run
        this.name = null
        this.group = null
        this.description = null
        this.usage = null
        this.alias = null
        this.permissions = null
    }

    setName(name) {
        this.name = name
        return this
    }

    setGroup(group) {
        this.group = group
        return this
    }

    setDescription(description) {
        this.description = description
        return this
    }

    setUsage(usage) {
        this.usage = usage
        return this
    }

    setAlias(alias) {
        this.alias = alias
        return this
    }

    setPermissions(permissions) {
        this.permissions = permissions
        return this
    }
}

module.exports = Command