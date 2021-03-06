import Discord from "discord.js"
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
    key: "channel",
    name: "arg_question_channel_display_name",
    desc: "arg_question_channel_desc",
})
@argument({
    type: ARGUMENT_TYPES.STRING,
    key: "channelName",
    name: "arg_channel_name_name",
    desc: "arg_channel_name_desc",
    defaultValue: "❓┃{}",
})
@argument({
    type: ARGUMENT_TYPES.STRING,
    key: "resolveReaction",
    name: "arg_resolve_reaction_name",
    desc: "arg_resolve_reaction_desc",
    defaultValue: "✅"
})
@argument({
    type: ARGUMENT_TYPES.STRING,
    key: "deleteMessage",
    name: "arg_delete_message_name",
    desc: "arg_delete_message_desc",
    defaultValue: "❌"
})
@argument({
    type: ARGUMENT_TYPES.NUMBER,
    key: "acceptReputation",
    name: "arg_accept_reputation_name",
    desc: "arg_accept_reputation_desc",
    defaultValue: 10
})
@argument({
    type: ARGUMENT_TYPES.NUMBER,
    key: "messageReputation",
    name: "arg_message_reputation_name",
    desc: "arg_message_reputation_desc",
    defaultValue: 1
})
@argument({
    type: ARGUMENT_TYPES.NUMBER,
    key: "messageReputationTimeout",
    name: "arg_message_reputation_timeout_name",
    desc: "arg_message_reputation_timeout_desc",
    defaultValue: 7500
})
@argument({
    type: ARGUMENT_TYPES.NUMBER,
    key: "askChannelRateLimit",
    name: "arg_ask_channel_rate_limit_name",
    desc: "arg_ask_channel_rate_limit_desc",
    defaultValue: 300
})
class QuestionChannelsModule extends Module {
    static config = Configuration

    config: Configuration
    channelManager: ChannelManager
    helpMessage: Discord.Message

    async start() {
        this.channelManager = new ChannelManager(this.context, this.config)

        await this.fetchHelpMessage()

        await this.config.channel.setRateLimitPerUser(this.config.askChannelRateLimit)

        this.channelManager.init()
    }

    async stop() {
        const instance = await ModuleInstance.findByContext(this.context)

        delete instance.data.helpMessage

        await Promise.all([
            this.helpMessage.delete(),
            instance.update(),
            this.config.channel.setRateLimitPerUser(0),
            this.channelManager.delete()
        ])
    }

    async fetchHelpMessage() {
        const instance = await ModuleInstance.findByContext(this.context)
        const settings = await ModuleInstance.config(this.context.guild, "settings") as SettingsConfig
        const locale = (await LocaleProvider.guild(this.context.guild)).scope("question-channels")
        
        if (!instance.data.helpMessage) {
            this.helpMessage = await this.config.channel.send(new HelpEmbed(settings, locale))
            instance.data.helpMessage = this.helpMessage.id
            await instance.update()
        } else {
            this.helpMessage = await this.config.channel.messages.fetch(instance.data.helpMessage)
        }
    }
}

export default QuestionChannelsModule
