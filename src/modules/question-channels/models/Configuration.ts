import Discord from "discord.js"
import DefaultConfig from "../../../lib/Configuration"
import DescriptiveObject from "../../../lib/DescriptiveObject"
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

    static guildConfig = new DescriptiveObject({
        value: {}
    })

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
