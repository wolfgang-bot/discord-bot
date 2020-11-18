const Module = require("../../lib/Module.js")
const Configuration = require("./Configuration.js")
const VoiceChannelManager = require("./VoiceChannelManager.js")

class DynamicVoicechannelModule extends Module {
    client = null
    config = null

    static async fromConfig(client, config) {
        const parentChannel = await client.channels.fetch(config.parentChannelId)
        return new DynamicVoicechannelModule(client, new Configuration({ parentChannel }))
    }

    static async fromMessage(message, args) {
        if (!args[0]) {
            await message.channel.send("Keine Kategorie angegeben")
            return
        }

        const parentChannel = message.guild.channels.cache.get(args[0])

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

module.exports = DynamicVoicechannelModule