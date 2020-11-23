const { v4: uuid } = require("uuid")
const Model = require("../lib/Model.js")

class User extends Model {
    constructor(values) {
        super({
            table: "users",
            columns: ["id", "user_id", "guild_id", "reputation"],
            defaultValues: {
                id: uuid,
                reputation: 0
            },
            ...values
        })

        this.discordUser = null
    }

    async fetchDiscordUser(client) {
        this.discordUser = await client.users.fetch(this.user_id)
    }
}

Model.bind(User, "users")

module.exports = User