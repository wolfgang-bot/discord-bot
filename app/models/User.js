const Model = require("../lib/Model.js")

class User extends Model {
    constructor(values) {
        super({
            table: "users",
            columns: ["id"],
            ...values
        })

        this.discordUser = null
    }

    async fetchDiscordUser(client) {
        this.discordUser = await client.users.fetch(this.id)
    }
}

Model.bind(User, "users")

module.exports = User