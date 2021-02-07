import Discord from "discord.js"
import Model from "../lib/Model"
import LocaleServiceProvider from "../services/LocaleServiceProvider"
import defaultConfigRaw from "../config/default"

export type GuildModelValues = {
    id: string
    locale?: string
    config?: any
}

let defaultConfig: object

function getDefaultConfig() {
    if (!defaultConfig) {
        defaultConfig = defaultConfigRaw.toVanillaObject()
    }

    return defaultConfig
}

class Guild extends Model implements GuildModelValues {
    static context = {
        model: Guild,
        table: "guilds"
    }
    locale: string
    config: any
    discordGuild: Discord.Guild

    static async config(guild: Discord.Guild) {
        let model = await Guild.findBy("id", guild.id) as Guild
        
        if (!model) {
            console.trace(`Guild '${guild.id}' - '${guild.name}' is not available`)
            return getDefaultConfig()
        }

        return model.config
    }

    constructor(values: GuildModelValues) {
        super({
            table: "guilds",
            columns: ["id", "locale", "config"],
            defaultValues: {
                locale: LocaleServiceProvider.defaultLocale,
                config: getDefaultConfig()
            },
            values
        })

        this.discordGuild = null
    }

    async fetchDiscordGuild(client: Discord.Client) {
        this.discordGuild = await client.guilds.fetch(this.id)
    }

    async delete() {
        // Delete members
        const members = await Member.findAllBy("guild_id", this.id)
        await members.mapAsync(member => member.delete())

        // Delete module instances
        const moduleInstances = await ModuleInstance.findAllBy("guild_id", this.id)
        await moduleInstances.mapAsync(instance => instance.delete())

        super.delete()
    }
    
    init() {
        if (typeof this.config === "string") {
            this.config = JSON.parse(this.config)
        }
    }
}

export default Guild

import Member from "./Member"
import ModuleInstance from "./ModuleInstance"