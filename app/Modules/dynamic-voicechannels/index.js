const Module = require("../../lib/Module.js")
const Configuration = require("./Configuration.js")
const VoiceChannelManager = require("./VoiceChannelManager.js")

class DynamicVoicechannelModule extends Module {
    static async fromConfig(client, config) {
        const parentChannel = await client.channels.fetch(config.parentChannelId)
        return new DynamicVoicechannelModule(client, new Configuration({ parentChannel }))
    }

    static async fromMessage(message, args) {
        if (!args[0]) {
            await message.channel.send("Keine Kategorie angegeben")
            return
        }

        const parentChannel = await message.guild.channels.cache.get(args[0])

        if (!parentChannel) {
            await message.channel.send("Die Kategorie existiert nicht")
            return
        }

        return new DynamicVoicechannelModule(message.client, new Configuration({ parentChannel }))
    }

    constructor(client, config) {
        super()

        this.client = client
        this.config = config

        this.voiceChannelManager = new VoiceChannelManager(this.client, this.config.parentChannel)
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

DynamicVoicechannelModule.meta = {
    description: "Sorgt dafür, dass es immer mindestens einen freien Kanal gibt.",
    arguments: "<kategorie_id>",
    features: [
        "Erstellt eine vorher definierte Anzahl an Sprachkanälen in der angegeben Kategorie, die immer existieren.",
        "Erstellt einen neuen Sprachkanal, wenn sich in allen Sprachkanälen mindestens ein Benutzer befindet.",
        "Entfernt die dynamisch erstellten Sprachkanäle wieder, wenn diese nicht mehr benötigt werden."
    ]
}

module.exports = DynamicVoicechannelModule