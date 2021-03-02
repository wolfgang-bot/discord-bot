import Discord from "discord.js"
import DefaultConfig from "../../../lib/Configuration"
import Context from "../../../lib/Context"
import DescriptiveObject from "../../../lib/DescriptiveObject"
import { emojiConstraint } from "../../../lib/constraints"

type ConfigProps = {
    channel: Discord.TextChannel,
    helpMessage: Discord.Message,
    channelName: string,
    resolveReaction: string,
    deleteMessage: string,
    acceptReputation: number,
    messageReputation: number,
    messageReputationTimeout: number,
    askChannelRateLimit: number
}

type ConfigArgs = [
    Discord.TextChannel,
    string,
    string,
    string,
    number,
    number,
    number,
    number
]

type ConfigJSON = {
    channelId: string,
    helpMessageId: string,
    channelName: string,
    resolveReaction: string,
    deleteMessage: string,
    acceptReputation: number,
    messageReputation: number,
    messageReputationTimeout: number,
    askChannelRateLimit: number
}

export default class Configuration extends DefaultConfig implements ConfigProps {
    channel: Discord.TextChannel
    helpMessage: Discord.Message
    channelName: string
    resolveReaction: string
    deleteMessage: string
    acceptReputation: number
    messageReputation: number
    messageReputationTimeout: number
    askChannelRateLimit: number

    static guildConfig = new DescriptiveObject({
        value: {}
    })

    static fromArgs([
        channel,
        channelName,
        resolveReaction,
        deleteMessage,
        acceptReputation,
        messageReputation,
        messageReputationTimeout,
        askChannelRateLimit
    ]: ConfigArgs) {
        if (!emojiConstraint.verifyConstraints(resolveReaction)) {
            throw emojiConstraint.constraints
        }

        return new Configuration({
            channel,
            helpMessage: null,
            channelName,
            resolveReaction,
            deleteMessage,
            acceptReputation,
            messageReputation,
            messageReputationTimeout,
            askChannelRateLimit
        })
    }

    static async fromJSON(context: Context, {
        channelId,
        helpMessageId,
        channelName,
        resolveReaction,
        deleteMessage,
        acceptReputation,
        messageReputation,
        messageReputationTimeout,
        askChannelRateLimit
    }: ConfigJSON) {
        const channel = context.guild.channels.cache.get(channelId) as Discord.TextChannel
        const helpMessage = await channel.messages.fetch(helpMessageId)
        return new Configuration({
            channel,
            helpMessage,
            channelName,
            resolveReaction,
            deleteMessage,
            acceptReputation,
            messageReputation,
            messageReputationTimeout,
            askChannelRateLimit
        })
    }

    constructor(props: ConfigProps) {
        super(props)

        this.channel = props.channel
        this.helpMessage = props.helpMessage
        this.channelName = props.channelName
        this.resolveReaction = props.resolveReaction
        this.deleteMessage = props.deleteMessage
        this.acceptReputation = props.acceptReputation
        this.messageReputation = props.messageReputation
        this.messageReputationTimeout = props.messageReputationTimeout
        this.askChannelRateLimit = props.askChannelRateLimit
    }

    toJSON(): ConfigJSON {
        return {
            channelId: this.channel.id,
            helpMessageId: this.helpMessage.id,
            channelName: this.channelName,
            resolveReaction: this.resolveReaction,
            deleteMessage: this.deleteMessage,
            acceptReputation: this.acceptReputation,
            messageReputation: this.messageReputation,
            messageReputationTimeout: this.messageReputationTimeout,
            askChannelRateLimit: this.askChannelRateLimit
        }
    }
}
