const properties = [
    "name",
    "group",
    "description",
    "usage",
    "alias",
    "permissions"
]

class Command {
    constructor(run) {
        this.run = run

        // Generate chainable setters for properties
        properties.forEach(prop => {
            this[prop] = null

            this["set" + prop.charAt(0).toUpperCase() + prop.slice(1)] = function(value) {
                this[prop] = value
                return this
            }
        })
    }
}

module.exports = Command