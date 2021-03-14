import Discord from "discord.js"
import Model from "../lib/Model"
import ModuleInstanceRegistry from "../services/ModuleInstanceRegistry"

export type GuildModelValues = {
    id: string
    config?: any
}

class Guild extends Model implements GuildModelValues {
    static context = {
        model: Guild,
        table: "guilds"
    }
    discordGuild: Discord.Guild
    id: string

    constructor(values: GuildModelValues) {
        super({
            table: "guilds",
            columns: ["id"],
            values
        })

        this.discordGuild = null
    }

    async fetchDiscordGuild(client: Discord.Client) {
        this.discordGuild = await client.guilds.fetch(this.id)
    }

    async delete() {
        const members = await Member.findAllBy("guild_id", this.id)
        await members.mapAsync(member => member.delete())

        const moduleInstances = await ModuleInstance.findAllBy("guild_id", this.id)
        await moduleInstances.mapAsync(instance => instance.delete())
        delete ModuleInstanceRegistry.instances[this.id]

        super.delete()
    }
    
    init() {}
}

export default Guild

import Member from "./Member"
import ModuleInstance from "./ModuleInstance"
