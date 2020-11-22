class Command {
    constructor(run) {
        this.run = run

        this.name = null
        this.group = null
        this.description = null
        this.arguments = null
        this.alias = null
        this.permissions = null
    }

    setName(value) {
        this.name = value
        return this
    }

    setGroup(value) {
        this.group = value
        return this
    }

    setDescription(value) {
        this.description = value
        return this
    }

    setArguments(value) {
        this.arguments = value
        return this
    }

    setAlias(value) {
        this.alias = value
        return this
    }

    setPermissions(value) {
        this.permissions = value
        return this
    }
}

module.exports = Command