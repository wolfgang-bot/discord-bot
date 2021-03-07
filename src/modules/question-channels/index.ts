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
    name: "Question Channels",
    desc: "Manages textchannels used for answering questions.",
    features: [
        "Creates a textchannel for a user when he asks a question in the question channel.",
        "Removes a textchannel when the creator marks a message as the answer or the question as irrelevant.",
        "Integrates with the 'reputation-system' module."
    ]
})
@argument({
    type: ARGUMENT_TYPES.TEXT_CHANNEL,
    key: "channel",
    name: "Question Channel",
    desc: "The channel in which questions can be asked.",
})
@argument({
    type: ARGUMENT_TYPES.STRING,
    key: "channelName",
    name: "Channel Name",
    desc: "Template for the question channel names ('{}' will be replaced by the author's username)",
    defaultValue: "❓┃{}",
})
@argument({
    type: ARGUMENT_TYPES.STRING,
    key: "resolveReaction",
    name: "Resolve Reaction",
    desc: "Name of the reaction a question's author has to give to an answer to resolve the channel",
    defaultValue: "✅"
})
@argument({
    type: ARGUMENT_TYPES.STRING,
    key: "deleteMessage",
    name: "Delete Message",
    desc: "Content of the message a question's author has to sent into the question channel to delete it",
    defaultValue: "❌"
})
@argument({
    type: ARGUMENT_TYPES.NUMBER,
    key: "acceptReputation",
    name: "Accept Reputation",
    desc: "Amount of reputation a user receives when his message is marked as the answer",
    defaultValue: 10
})
@argument({
    type: ARGUMENT_TYPES.NUMBER,
    key: "messageReputation",
    name: "Message Reputation",
    desc: "Amount of reputation a user receives when sending a message into a question channel",
    defaultValue: 1
})
@argument({
    type: ARGUMENT_TYPES.NUMBER,
    key: "messageReputationTimeout",
    name: "Message Reputation Timeout",
    desc: "Duration of the timeout a user receives for receiving points by sending a message into a question channel (in ms)",
    defaultValue: 7500
})
@argument({
    type: ARGUMENT_TYPES.NUMBER,
    key: "askChannelRateLimit",
    name: "Ask Channel Rate Limit",
    desc: "Duration of the rate limit the ask-channel receives when initializing the module",
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
