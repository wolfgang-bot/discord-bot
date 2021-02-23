import Discord from "discord.js"
import Model from "@personal-discord-bot/shared/dist/orm/Model"
import LocaleProvider from "../services/LocaleProvider"
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
                locale: LocaleProvider.defaultLocale,
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
        const members = await Member.findAllBy("guild_id", this.id)
        await members.mapAsync(member => member.delete())

        const moduleInstances = await ModuleInstance.findAllBy("guild_id", this.id)
        await moduleInstances.mapAsync(instance => instance.delete())

        const events = await Event.findAllBy("guild_id", this.id)
        await events.mapAsync(event => event.delete())

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
import Event from "./Event"
