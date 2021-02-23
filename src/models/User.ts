import Discord from "discord.js"
import { APIUser } from "discord-api-types/v8"
import Model from "@personal-discord-bot/shared/dist/Model"
import { checkPermissions } from "../utils"

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
    discordUser: Discord.User | APIUser = null

    constructor(values: UserModelValues) {
        super({
            table: "users",
            columns: ["id", "access_token", "refresh_token"],
            values
        })
    }

    isAdmin(guild: Discord.Guild | Guild) {
        if (guild instanceof Guild) {
            if (!guild.discordGuild) {
                throw new Error(`Discord guild for guild '${guild.id}' is not available`)
            }

            guild = guild.discordGuild
        }

        return checkPermissions(guild, this, ["MANAGE_GUILD"])
    }
    
    init() {}

    async fetchDiscordUser(client: Discord.Client) {
        this.discordUser = await client.users.fetch(this.id)
    }

    toJSON() {
        return {
            id: this.id,
            username: this.discordUser?.username,
            discriminator: this.discordUser?.discriminator,
            avatar: this.discordUser?.avatar
        }
    }
}

export default User

import Guild from "./Guild"
