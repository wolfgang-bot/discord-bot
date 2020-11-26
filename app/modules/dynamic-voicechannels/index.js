const Module = require("../../lib/Module.js")
const Configuration = require("./Configuration.js")
const VoiceChannelManager = require("./managers/VoiceChannelManager.js")

class DynamicVoicechannelsModule extends Module {
    static async fromConfig(client, guild, config) {
        const parentChannel = await guild.channels.cache.get(config.parentChannelId)
        return new DynamicVoicechannelsModule(client, guild, new Configuration({ parentChannel }))
    }

    static async fromArguments(client, guild, args) {
        if (!args[0]) {
            throw "Keine Kategorie angegeben"
        }

        const parentChannel = await guild.channels.cache.get(args[0])

        if (!parentChannel || parentChannel.type !== "category") {
            throw "Die Kategorie existiert nicht"
        }

        return new DynamicVoicechannelsModule(client, guild, new Configuration({ parentChannel }))
    }

    constructor(client, guild, config) {
        super()

        this.client = client
        this.guild = guild
        this.config = config

        this.voiceChannelManager = new VoiceChannelManager(this.client, this.guild, this.config.parentChannel)
    }

    async start() {
        await this.voiceChannelManager.init()
    }

    async stop() {
        await this.voiceChannelManager.delete()
    }

    getConfig() {
        return this.config
    }
}

DynamicVoicechannelsModule.meta = {
    description: "Sorgt dafür, dass es immer mindestens einen freien Kanal gibt.",
    arguments: "<kategorie_id>",
    features: [
        "Erstellt eine vorher definierte Anzahl an Sprachkanälen in der angegeben Kategorie, die immer existieren.",
        "Erstellt einen neuen Sprachkanal, wenn sich in allen Sprachkanälen mindestens ein Benutzer befindet.",
        "Entfernt die dynamisch erstellten Sprachkanäle wieder, wenn diese nicht mehr benötigt werden."
    ]
}

module.exports = DynamicVoicechannelsModule