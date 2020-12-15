const LocaleServiceProvider = require("../../services/LocaleServiceProvider.js")
const Configuration = require("./models/Configuration.js")
const VoiceChannelManager = require("./managers/VoiceChannelManager.js")

class DynamicVoicechannelsModule {
    static async fromConfig(client, module, guild, config) {
        const parentChannel = await guild.channels.cache.get(config.parentChannelId)
        return new DynamicVoicechannelsModule(client, module, guild, new Configuration({ parentChannel }))
    }

    static async fromArguments(client, module, guild, args) {
        const locale = await LocaleServiceProvider.guild(guild)
        const moduleLocale = locale.scope("dynamic-voicechannels")

        if (!args[0]) {
            throw locale.translate("error_missing_argument", moduleLocale.translate("arg_category_channel_name"))
        }

        const parentChannel = await guild.channels.cache.get(args[0])

        if (!parentChannel || parentChannel.type !== "category") {
            throw moduleLocale.translate("error_category_does_not_exist")
        }

        return new DynamicVoicechannelsModule(client, module, guild, new Configuration({ parentChannel }))
    }

    constructor(client, module, guild, config) {
        this.client = client
        this.module = module
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

module.exports = DynamicVoicechannelsModule