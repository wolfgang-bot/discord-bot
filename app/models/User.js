const Model = require("../lib/Model.js")

class User extends Model {
    constructor(values) {
        super({
            table: "users",
            columns: ["id", "access_token", "refresh_token"],
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
            username: this.username,
            avatar: this.avatar
        }
    }
}

Model.bind(User, "users")

module.exports = User