const Module = require("../../lib/Module.js")
const LocaleServiceProvider = require("../../services/LocaleServiceProvider.js")
const Configuration = require("./Configuration.js")
const ChannelManager = require("./managers/ChannelManager.js")
const HelpEmbed = require("./embeds/HelpEmbed.js")
const Guild = require("../../models/Guild.js")

class QuestionChannelsModule extends Module {
    static async fromConfig(client, guild, config) {
        const channel = await guild.channels.cache.get(config.channelId)
        const helpMessage = await channel.messages.fetch(config.helpMessageId)
        return new QuestionChannelsModule(client, guild, new Configuration({ channel, helpMessage }))
    }

    static async fromArguments(client, guild, args) {
        const locale = await LocaleServiceProvider.guild(guild)

        if (!args[0]) {
            throw locale.translate("error_missing_argument", "question_channel")
        }

        const channel = await guild.channels.cache.get(args[0])

        if (!channel) {
            throw locale.translate("module_question_channels_error_textchannel_does_not_exist")
        }

        const config = new Configuration({ channel })

        return new QuestionChannelsModule(client, guild, config)
    }

    constructor(client, guild, config) {
        super()

        this.client = client
        this.guild = guild
        this.config = config

        this.channelManager = new ChannelManager(this.client, this.guild, this.config.channel)
    }

    async start() {
        const guildConfig = await Guild.config(this.guild)
        const moduleConfig = guildConfig["question-channels"]
        const locale = await LocaleServiceProvider.guild(this.guild)

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
            this.config.channel.setRateLimitPerUser(0)
        ])
        this.channelManager.delete()
    }

    getConfig() {
        return this.config
    }
}

QuestionChannelsModule.meta = {
    description: "module_question_channels_desc",
    arguments: "module_question_channels_args",
    features: "module_question_channels_features"
}

module.exports = QuestionChannelsModule