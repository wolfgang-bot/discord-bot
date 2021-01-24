import * as Discord from "discord.js"
import DefaultConfig from "../../../lib/Configuration"
import Context from "../../../lib/Context"

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

class Configuration extends DefaultConfig implements ConfigProps {
    channel: Discord.TextChannel
    helpMessage: Discord.Message
    channelName: string = "❓┃{}"
    resolveReaction: string = "✅"
    deleteMessage: string = "❌"
    acceptReputation: number = 10
    messageReputation: number = 1
    messageReputationTimeout: number = 7500
    askChannelRateLimit: number = 300

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

export default Configuration