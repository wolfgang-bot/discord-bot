const LocaleServiceProvider = require("../../services/LocaleServiceProvider.js")
const Configuration = require("./models/Configuration.js")
const ChannelManager = require("./managers/ChannelManager.js")
const HelpEmbed = require("./embeds/HelpEmbed.js")
const Guild = require("../../models/Guild.js")

class QuestionChannelsModule {
    static async fromConfig(client, module, guild, config) {
        const channel = await guild.channels.cache.get(config.channelId)
        const helpMessage = await channel.messages.fetch(config.helpMessageId)
        return new QuestionChannelsModule(client, module, guild, new Configuration({ channel, helpMessage }))
    }

    static async fromArguments(client, module, guild, args) {
        const locale = await LocaleServiceProvider.guild(guild)
        const moduleLocale = locale.scope("question-channels")

        if (!args[0]) {
            throw locale.translate("error_missing_argument", moduleLocale.translate("arg_question_channel_name"))
        }

        const channel = await guild.channels.cache.get(args[0])

        if (!channel) {
            throw moduleLocale.translate("error_textchannel_does_not_exist")
        }

        const config = new Configuration({ channel })

        return new QuestionChannelsModule(client, module, guild, config)
    }

    constructor(client, module, guild, config) {
        this.client = client
        this.module = module
        this.guild = guild
        this.config = config

        this.channelManager = new ChannelManager(this.client, this.guild, this.config.channel)
    }

    async start() {
        const guildConfig = await Guild.config(this.guild)
        const moduleConfig = guildConfig["question-channels"]
        const locale = (await LocaleServiceProvider.guild(this.guild)).scope("question-channels")

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

module.exports = QuestionChannelsModule