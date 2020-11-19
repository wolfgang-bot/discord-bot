const Model = require("../lib/Model.js")

class User extends Model {
    constructor(values) {
        super({
            table: "users",
            columns: ["id", "reputation"],
            defaultValues: {
                reputation: 0
            },
            ...values
        })
    }

    toJSON() {
        return {
            id: this.id,
            reputation: this.reputation
        }
    }
}

Model.bind(User, "users")

module.exports = User