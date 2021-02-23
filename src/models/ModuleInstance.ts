import { v4 as uuid } from "uuid"
import Discord from "discord.js"
import Model from "@personal-discord-bot/shared/dist/Model"

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
