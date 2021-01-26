import Module from "../../lib/Module"
import LocaleServiceProvider from "../../services/LocaleServiceProvider"
import Configuration from "./models/Configuration"
import ChannelManager from "./managers/ChannelManager"
import HelpEmbed from "./embeds/HelpEmbed"
import Guild from "../../models/Guild"

class QuestionChannelsModule extends Module {
    static makeConfigFromArgs = Configuration.fromArgs
    static makeConfigFromJSON = Configuration.fromJSON

    config: Configuration
    channelManager: ChannelManager

    async start() {
        this.channelManager = new ChannelManager(this.context, this.config)

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

export default QuestionChannelsModule