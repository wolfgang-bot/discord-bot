import * as Discord from "discord.js"
import Model from "../lib/Model"

export type UserModelValues = {
    id: string
    access_token?: string
    refresh_token?: string
}

class User extends Model implements UserModelValues {
    static context = {
        model: User,
        table: "users"
    }
    access_token?: string
    refresh_token?: string
    discordUser: Discord.User = null

    constructor(values: UserModelValues) {
        super({
            table: "users",
            columns: ["id", "access_token", "refresh_token"],
            values
        })
    }

    init() {}

    async fetchDiscordUser(client: Discord.Client) {
        this.discordUser = await client.users.fetch(this.id)
    }

    toJSON() {
        return {
            id: this.id,
            username: this.discordUser.username,
            discriminator: this.discordUser.discriminator,
            avatar: this.discordUser.avatar
        }
    }
}

export default User