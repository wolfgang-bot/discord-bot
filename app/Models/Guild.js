const { v4: uuid } = require("uuid")
const path = require("path")
const Model = require("../lib/Model.js")

const DEFAULT_CONFIG_PATH = path.join(__dirname, "..", "..", "config", "default.js")
const defaultConfig = require(DEFAULT_CONFIG_PATH)

class Guild extends Model {
    static async config(guild) {
        let model = await Guild.findBy("guild_id", guild.id)
        
        if (!model) {
            console.trace(`Guild '${guild.id}' - '${guild.name}' ist not available`)
            return defaultConfig
        }

        return model.config
    }

    constructor(values) {
        super({
            table: "guilds",
            columns: ["id", "guild_id", "config"],
            defaultValues: {
                id: uuid,
                config: defaultConfig
            },
            ...values
        })
    }

    init() {
        this.config = JSON.parse(this.config)
    }
}

Model.bind(Guild, "guilds")

module.exports = Guild