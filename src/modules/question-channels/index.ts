import Module from "../../lib/Module"
import { module, argument } from "../../lib/decorators"
import { TYPES as ARGUMENT_TYPES } from "../../lib/Argument"
import LocaleProvider from "../../services/LocaleProvider"
import Configuration from "./models/Configuration"
import ChannelManager from "./managers/ChannelManager"
import HelpEmbed from "./embeds/HelpEmbed"
import ModuleInstance from "../../models/ModuleInstance"
import SettingsConfig from "../settings/models/Configuration"

@module({
    key: "question-channels",
    name: "meta_name",
    desc: "meta_desc",
    features: "meta_features"
})
@argument({
    type: ARGUMENT_TYPES.TEXT_CHANNEL,
    key: "question_channel_id",
    name: "arg_question_channel_display_name",
    desc: "arg_question_channel_desc",
})
@argument({
    type: ARGUMENT_TYPES.STRING,
    key: "channel_name",
    name: "arg_channel_name_name",
    desc: "arg_channel_name_desc",
    defaultValue: "❓┃{}",
})
@argument({
    type: ARGUMENT_TYPES.STRING,
    key: "resolve_reaction",
    name: "arg_resolve_reaction_name",
    desc: "arg_resolve_reaction_desc",
    defaultValue: "✅"
})
@argument({
    type: ARGUMENT_TYPES.STRING,
    key: "delete_message",
    name: "arg_delete_message_name",
    desc: "arg_delete_message_desc",
    defaultValue: "❌"
})
@argument({
    type: ARGUMENT_TYPES.NUMBER,
    key: "accept_reputation",
    name: "arg_accept_reputation_name",
    desc: "arg_accept_reputation_desc",
    defaultValue: 10
})
@argument({
    type: ARGUMENT_TYPES.NUMBER,
    key: "message_reputation",
    name: "arg_message_reputation_name",
    desc: "arg_message_reputation_desc",
    defaultValue: 1
})
@argument({
    type: ARGUMENT_TYPES.NUMBER,
    key: "message_reputation_timeout",
    name: "arg_message_reputation_timeout_name",
    desc: "arg_message_reputation_timeout_desc",
    defaultValue: 7500
})
@argument({
    type: ARGUMENT_TYPES.NUMBER,
    key: "ask_channel_rate_limit",
    name: "arg_ask_channel_rate_limit_name",
    desc: "arg_ask_channel_rate_limit_desc",
    defaultValue: 300
})
class QuestionChannelsModule extends Module {
    static makeConfigFromArgs = Configuration.fromArgs
    static makeConfigFromJSON = Configuration.fromJSON

    config: Configuration
    channelManager: ChannelManager

    async start() {
        this.channelManager = new ChannelManager(this.context, this.config)

        const settings = await ModuleInstance.config(this.context.guild, "settings") as SettingsConfig
        const locale = (await LocaleProvider.guild(this.context.guild)).scope("question-channels")

        // Send help embed into channel if hasn't already
        if (!this.config.helpMessage) {
            this.config.helpMessage = await this.config.channel.send(new HelpEmbed(settings, locale))
        }

        await this.config.channel.setRateLimitPerUser(this.config.askChannelRateLimit)

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
