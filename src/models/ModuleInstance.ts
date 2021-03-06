import { v4 as uuid } from "uuid"
import Discord from "discord.js"
import Model from "../lib/Model"

export type ModuleInstanceModelValues = {
    id?: string
    module_id: string
    guild_id: string
    config: object
    data?: any
}

class ModuleInstance extends Model implements ModuleInstanceModelValues {
    static context = {
        model: ModuleInstance,
        table: "module_instances"
    }
    module_id: string
    guild_id: string
    config: object
    data: any
    module: Module
    guild: Guild
    discordUser: Discord.User

    static async findByGuildAndModuleKey(guild: Discord.Guild | Guild, key: string) {
        const module = await Module.findBy("key", key)
        return await ModuleInstance.where(`
            guild_id='${guild.id}' AND module_id='${module.id}'`
        ) as ModuleInstance
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
            columns: ["id", "module_id", "guild_id", "config", "data"],
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
        this.module = await Module.findBy("id", this.module_id) as Module
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
