import Discord from "discord.js"
import DefaultConfig from "@personal-discord-bot/shared/dist/module/Configuration"
import { Context } from "@personal-discord-bot/shared/dist/module"
import { DescriptiveObject } from "@personal-discord-bot/shared/dist"
import { emojiConstraint } from "@personal-discord-bot/shared/dist/constraints"

type ConfigProps = {
    channel: Discord.TextChannel
    helpMessage: Discord.Message
    channelName?: string
    resolveReaction?: string
    deleteMessage?: string
    acceptReputation?: number
    messageReputation?: number
    messageReputationTimeout?: number
    askChannelRateLimit?: number
}

type ConfigArgs = [Discord.TextChannel, Discord.Message]

type ConfigJSON = {
    channelId: string
    helpMessageId: string
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
        value: {
            channelName: new DescriptiveObject({
                description: "Template for the question channel names ('{}' will be replaced by the author's username)",
                value: "❓┃{}"
            }),

            resolveReaction: new DescriptiveObject({
                description: "Name of the reaction a question's author has to give the to an answer to resolve the channel",
                value: "✅",
                ...emojiConstraint
            }),

            deleteMessage: new DescriptiveObject({
                description: "Content of the message a question's author has to sent into the question channel to delete it",
                value: "❌"
            }),

            acceptReputation: new DescriptiveObject({
                description: "Amount of reputation a user receives when his message is marked as the answer",
                value: 10
            }),

            messageReputation: new DescriptiveObject({
                description: "Amount of reputation a user receives when sending a message into a question channel",
                value: 1
            }),

            messageReputationTimeout: new DescriptiveObject({
                description: "Duration of the timeout a user receives for receiving points by sending a message into a question channel (in ms)",
                value: 7500
            }),

            askChannelRateLimit: new DescriptiveObject({
                description: "Duration of the rate limit the ask-channel receives when initializing the module",
                value: 300
            })
        }
    })

    static fromArgs(args: ConfigArgs) {
        return new Configuration({ channel: args[0], helpMessage: args[1] })
    }

    static async fromJSON(context: Context, object: ConfigJSON) {
        const channel = await context.guild.channels.cache.get(object.channelId) as Discord.TextChannel
        const helpMessage = await channel.messages.fetch(object.helpMessageId)
        return new Configuration({ channel, helpMessage })
    }

    constructor(props: ConfigProps) {
        super(props)

        this.channel = props.channel
        this.helpMessage = props.helpMessage
    }

    toJSON(): ConfigJSON {
        return {
            channelId: this.channel.id,
            helpMessageId: this.helpMessage.id
        }
    }
}
