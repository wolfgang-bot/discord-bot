import * as Discord from "discord.js"
import Model from "../lib/Model"
import Member from "./Member"
import ModuleInstance from "./ModuleInstance"
import { formatDescriptiveObject } from "../utils"
import LocaleServiceProvider from "../services/LocaleServiceProvider"
import defaultConfigRaw from "../config/default"

export type GuildModelValues = {
    id: string
    locale?: string
    config?: any
}

const defaultConfig: any = formatDescriptiveObject(defaultConfigRaw)

class Guild extends Model implements GuildModelValues {
    locale: string
    config: any
    discordGuild: Discord.Guild

    static async config(guild: Discord.Guild) {
        let model = await Guild.findBy("id", guild.id) as Guild
        
        if (!model) {
            console.trace(`Guild '${guild.id}' - '${guild.name}' is not available`)
            return defaultConfig
        }

        return model.config
    }

    constructor(values: GuildModelValues) {
        super({
            table: "guilds",
            columns: ["id", "locale", "config"],
            defaultValues: {
                locale: LocaleServiceProvider.defaultLocale,
                config: defaultConfig
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

Model.bind(Guild, "guilds")

export default Guild