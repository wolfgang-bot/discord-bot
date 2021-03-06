import { v4 as uuid } from "uuid"
import Discord from "discord.js"
import Model from "../lib/Model"
import Context from "../lib/Context"

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

    static async findByGuildAndModuleKey(guild: Discord.Guild | Guild, key: string) {
        return await ModuleInstance.where(`
            guild_id='${guild.id}' AND module_key='${key}'`
        ) as ModuleInstance
    }

    static findByContext(context: Context) {
        return this.findByGuildAndModuleKey(context.guild, context.module.key)
    }

    static async config(guild: Discord.Guild | Guild, key: string) {
        const instance = await this.findByGuildAndModuleKey(guild, key)

        if (!instance) {
            console.warn(`Could not find config of module '${key}' for guild '${guild.id}'`)
            return
        }

        return instance.config
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

