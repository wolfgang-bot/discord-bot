const LocaleServiceProvider = require("../../services/LocaleServiceProvider.js")
const Configuration = require("./models/Configuration.js")
const ChannelManager = require("./managers/ChannelManager.js")
const HelpEmbed = require("./embeds/HelpEmbed.js")
const Guild = require("../../models/Guild.js")

class QuestionChannelsModule {
    static makeConfigFromArgs = Configuration.fromArgs
    static makeConfigFromJSON = Configuration.fromJSON

    constructor(context, config) {
        this.context = context
        this.config = config
    }

    async start() {
        this.channelManager = new ChannelManager(this.context, this.config.channel)

        const guildConfig = await Guild.config(this.context.guild)
        const moduleConfig = guildConfig["question-channels"]
        const locale = (await LocaleServiceProvider.guild(this.context.guild)).scope("question-channels")

        // Send help embed into channel if hasn't already
        if (!this.config.helpMessage) {
            this.config.helpMessage = await this.config.channel.send(new HelpEmbed(guildConfig, locale))
        }

        await this.config.channel.setRateLimitPerUser(moduleConfig.askChannelRateLimit)

        this.channelManager.init()
    }

    async stop() {
        await Promise.all([
            this.config.helpMessage.delete(),
            this.config.channel.setRateLimitPerUser(0),
            this.channelManager.delete()
        ])

        delete this.config.helpMessage
    }

    getConfig() {
        return this.config
    }
}

module.exports = QuestionChannelsModule