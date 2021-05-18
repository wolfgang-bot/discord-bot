import { v4 as uuid } from "uuid"
import Discord from "discord.js"
import log from "loglevel"
import Model from "../lib/Model"
import Collection from "../lib/Collection"
import Context from "../lib/Context"
import { ExtendedAPIGuild } from "../www/services/OAuthServiceProvider"
import database from "../database"

export type ModuleInstanceModelValues = {
    id?: string
    module_key: string
    guild_id: string
    config: object
    data?: any
}

class ModuleInstance extends Model implements ModuleInstanceModelValues {
    static context = {
        model: ModuleInstance,
        table: "module_instances"
    }
    id: string
    module_key: string
    guild_id: string
    config: object
    data: any
    module: Module
    guild: Guild
    discordUser: Discord.User

    static async findByGuildAndModuleKey(guild: Discord.Guild | Guild | ExtendedAPIGuild, key: string) {
        return await ModuleInstance.whereAll(`
            guild_id='${guild.id}'
            AND module_key='${key}'`
        ) as Collection<ModuleInstance>
    }

    static findByContext(context: Context) {
        return this.findBy("id", context.instanceId) as Promise<ModuleInstance>
    }

    static async countModuleKeys() {
        const rows = await database.query(`
            SELECT module_key, COUNT('*') as count
            FROM module_instances
            GROUP BY module_key
        `) as { module_key: string, count: number }[]

        const map = Object.fromEntries(
            rows.map(row => [row.module_key, row.count])
        )
        
        return map as Record<string, number>
    }

    static async config(guild: Discord.Guild | Guild | ExtendedAPIGuild, key: string) {
        const instances = await this.findByGuildAndModuleKey(guild, key)

        if (!instances || !instances?.length) {
            log.warn(`Could not find config of module '${key}' for guild '${guild.id}'`)
            return
        }

        return instances[0].config
    }

    constructor(values: ModuleInstanceModelValues) {
        super({
            table: "module_instances",
            columns: ["id", "module_key", "guild_id", "config", "data"],
            defaultValues: {
                id: uuid,
                data: {}
            },
            values
        })

        this.module = null
        this.guild = null
        this.discordUser = null
    }

    async fetchModule() {
        this.module = await Module.findBy("key", this.module_key) as Module
    }

    async fetchGuild() {
        this.guild = await Guild.findBy("id", this.guild_id) as Guild
    }

    init() {
        if (typeof this.config === "string") {
            this.config = JSON.parse(this.config)
        }

        if (typeof this.data === "string") {
            this.data = JSON.parse(this.data)
        }
    }
}

export default ModuleInstance

import Module from "./Module"
import Guild from "./Guild"
