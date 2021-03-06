import { v4 as uuid } from "uuid"
import Discord from "discord.js"
import Model from "../lib/Model"

export type MemberModelValues = {
    id?: string
    user_id: string
    guild_id: string
    reputation?: number
}

class Member extends Model implements MemberModelValues {
    static context = {
        model: Member,
        table: "members"
    }
    id: string
    user_id: string
    guild_id: string
    reputation: number
    user: User
    guild: Guild
    discordUser: Discord.User

    constructor(values: MemberModelValues) {
        super({
            table: "members",
            columns: ["id", "user_id", "guild_id", "reputation"],
            defaultValues: {
                id: uuid,
                reputation: 0
            },
            values
        })

        this.user = null
        this.guild = null
        this.discordUser = null
    }

    init() {}

    async fetchUser() {
        this.user = await User.findBy("id", this.user_id) as User
    }
    
    async fetchGuild() {
        this.guild = await Guild.findBy("id", this.guild_id) as Guild
    }
    
    async fetchDiscordUser(client: Discord.Client) {
        this.discordUser = await client.users.fetch(this.user_id)
    }
}

export default Member

import User from "./User"
import Guild from "./Guild"
