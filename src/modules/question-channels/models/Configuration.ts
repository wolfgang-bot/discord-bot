import Discord from "discord.js"
import DefaultConfig from "../../../lib/Configuration"
import { emojiConstraint } from "../../../lib/constraints"

type ConfigProps = {
    channel: Discord.TextChannel,
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
    channelName: string
    resolveReaction: string
    deleteMessage: string
    acceptReputation: number
    messageReputation: number
    messageReputationTimeout: number
    askChannelRateLimit: number

    constructor(props: ConfigProps) {
        super(props)

        if (!emojiConstraint.verifyConstraints(this.resolveReaction)) {
            throw emojiConstraint.constraints
        }
    }

    toJSON() {
        return {
            ...this,
            channel: this.channel.id
        }
    }
}
