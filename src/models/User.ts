import Discord from "discord.js"
import { APIUser } from "discord-api-types/v8"
import Model from "../lib/Model"
import { checkPermissions, isBotAdmin } from "../utils"

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
    id: string
    access_token?: string
    refresh_token?: string
    discordUser: Discord.User | APIUser = null
    isBotAdmin: boolean

    constructor(values: UserModelValues) {
        super({
            table: "users",
            columns: ["id", "access_token", "refresh_token"],
            values
        })

        this.isBotAdmin = isBotAdmin(this.id)
    }

    isAdmin(guild: Discord.Guild | Guild) {
        if (guild instanceof Guild) {
            if (!guild.discordGuild) {
                throw new Error(`Discord guild for guild '${guild.id}' is not available`)
            }

            guild = guild.discordGuild
        }

        return checkPermissions(guild, this, ["ADMINISTRATOR"])
    }
    
    init() {}

    async fetchDiscordUser(client: Discord.Client) {
        this.discordUser = await client.users.fetch(this.id)
    }

    toJSON() {
        return {
            id: this.id,
            isBotAdmin: this.isBotAdmin,
            username: this.discordUser?.username,
            discriminator: this.discordUser?.discriminator,
            avatar: this.discordUser?.avatar,
            locale: this.discordUser?.locale
        }
    }
}

export default User

import Guild from "./Guild"
