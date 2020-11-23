const Module = require("../../lib/Module.js")
const Configuration = require("./Configuration.js")
const VoiceChannelManager = require("./VoiceChannelManager.js")

class DynamicVoicechannelsModule extends Module {
    static async fromConfig(client, guild, config) {
        const parentChannel = await guild.channels.cache.get(config.parentChannelId)
        return new DynamicVoicechannelsModule(client, guild, new Configuration({ parentChannel }))
    }

    static async fromMessage(client, guild, message, args) {
        if (!args[0]) {
            await message.channel.send("Keine Kategorie angegeben")
            return
        }

        const parentChannel = await guild.channels.cache.get(args[0])

        if (!parentChannel || parentChannel.type !== "category") {
            await message.channel.send("Die Kategorie existiert nicht")
            return
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