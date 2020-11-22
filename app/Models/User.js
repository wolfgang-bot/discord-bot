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

        this.discordUser = null
    }

    async fetchDiscordUser(client) {
        this.discordUser = await client.users.fetch(this.id)
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