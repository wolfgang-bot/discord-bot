const Module = require("../../lib/Module.js")
const LocaleServiceProvider = require("../../services/LocaleServiceProvider.js")
const Configuration = require("./Configuration.js")
const VoiceChannelManager = require("./managers/VoiceChannelManager.js")

class DynamicVoicechannelsModule extends Module {
    static async fromConfig(client, guild, config) {
        const parentChannel = await guild.channels.cache.get(config.parentChannelId)
        return new DynamicVoicechannelsModule(client, guild, new Configuration({ parentChannel }))
    }

    static async fromArguments(client, guild, args) {
        const locale = await LocaleServiceProvider.guild(guild)

        if (!args[0]) {
            throw locale.translate("error_missing_argument", "category")
        }

        const parentChannel = await guild.channels.cache.get(args[0])

        if (!parentChannel || parentChannel.type !== "category") {
            throw locale.translate("module_dynamic_voicechannels_error_category_does_not_exist")
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
    description: "module_dynamic_voicechannels_desc",
    arguments: "module_dynamic_voicechannels_arguments",
    features: "module_dynamic_voicechannels_features"
}

module.exports = DynamicVoicechannelsModule