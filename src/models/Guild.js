const path = require("path")
const Model = require("../lib/Model.js")
const { formatDescriptiveObject } = require("../utils")

const DEFAULT_CONFIG_PATH = path.join(__dirname, "..", "config", "default.js")
const defaultConfig = formatDescriptiveObject(require(DEFAULT_CONFIG_PATH))

class Guild extends Model {
    static async config(guild) {
        let model = await Guild.findBy("id", guild.id)
        
        if (!model) {
            console.trace(`Guild '${guild.id}' - '${guild.name}' ist not available`)
            return defaultConfig
        }

        return model.config
    }

    constructor(values) {
        super({
            table: "guilds",
            columns: ["id", "locale", "config"],
            defaultValues: {
                locale: LocaleServiceProvider.defaultLocale,
                config: defaultConfig
            },
            ...values
        })

        this.discordGuild = null
    }

    async fetchDiscordGuild(client) {
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

module.exports = Guild

const Member = require("./Member.js")
const ModuleInstance = require("./ModuleInstance.js")
const LocaleServiceProvider = require("../services/LocaleServiceProvider.js")