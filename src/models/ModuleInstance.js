const { v4: uuid } = require("uuid")
const Model = require("../lib/Model.js")

class ModuleInstance extends Model {
    constructor(values) {
        super({
            table: "module_instances",
            columns: ["id", "module_id", "guild_id", "config", "data"],
            defaultValues: {
                id: uuid,
                data: {}
            },
            ...values
        })

        this.module = null
        this.guild = null
        this.discordUser = null
    }

    async fetchModule() {
        this.module = await Module.findBy("id", this.module_id)
    }

    async fetchGuild() {
        this.guild = await Guild.findBy("id", this.guild_id)
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

module.exports = ModuleInstance

const Module = require("./Module.js")
const Guild = require("./Guild.js")