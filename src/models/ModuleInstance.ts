import { v4 as uuid } from "uuid"
import * as Discord from "discord.js"
import Model from "../lib/Model"
import Module from "./Module.js"
import Guild from "./Guild.js"

export type ModuleInstanceModelValues = {
    id?: string
    module_id: string
    guild_id: string
    config: object
    data?: any
}

class ModuleInstance extends Model implements ModuleInstanceModelValues {
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

Model.bind(ModuleInstance, "module_instances")

export default ModuleInstance