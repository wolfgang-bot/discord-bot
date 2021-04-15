import Discord from "discord.js"
import DefaultConfig, { Validator } from "../../../lib/Configuration"
import { emojiConstraint } from "../../../lib/constraints"

const MAX_AMOUNT_OF_CHANNELS = 100

type ConfigProps = {
    channel: Discord.TextChannel,
    channelName: string,
    resolveReaction: string,
    deleteMessage: string,
    acceptReputation: number,
    messageReputation: number,
    messageReputationTimeout: number,
    askChannelRateLimit: number,
    maxChannels: number
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
    maxChannels: number

    static validators: Validator<ConfigProps>[] = [
        {
            key: "resolveReaction",
            validate: (props) => emojiConstraint.verifyConstraints(props.resolveReaction),
            message: emojiConstraint.constraints
        },
        {
            key: "maxChannels",
            validate: (props) => props.maxChannels <= MAX_AMOUNT_OF_CHANNELS,
            message: `Cannot be greater than ${MAX_AMOUNT_OF_CHANNELS}`
        },
        {
            key: "maxChannels",
            validate: (props) => props.maxChannels > 0,
            message: "Must be greater than 0"
        }
    ]

    constructor(props: ConfigProps) {
        super(props)
        Configuration.validate(props)
    }

    toJSON() {
        return {
            ...this,
            channel: this.channel.id
        }
    }
}
