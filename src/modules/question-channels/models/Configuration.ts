import Discord from "discord.js"
import DefaultConfig, { Validator } from "../../../lib/Configuration"
import {
    channelNameConstraint,
    emojiConstraint,
    minMaxConstraint,
    useConstraint
} from "../../../lib/constraints"

const DELETE_MESSAGE_MIN_LENGTH = 1
const DELETE_MESSAGE_MAX_LENGTH = 30

const ACCEPT_REPUTATION_MIN = 0
const ACCEPT_REPUTATION_MAX = 5000

const MESSAGE_REPUTATION_MIN = 0
const MESSAGE_REPUTATION_MAX = 100

const MESSAGE_REPUTATION_TIMEOUT_MIN = 0
const MESSAGE_REPUTATION_TIMEOUT_MAX = 1e3 * 3600 // One Hour

const ASK_CHANNEL_RATE_LIMIT_MIN = 0
const ASK_CHANNEL_RATE_LIMIT_MAX = 1e3 * 3600 // One Hour

const MAX_CHANNELS_MIN_AMOUNT = 1
const MAX_CHANNELS_MAX_AMOUNT = 100

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

const deleteMessageConstraint = minMaxConstraint({
    min: DELETE_MESSAGE_MIN_LENGTH,
    max: DELETE_MESSAGE_MAX_LENGTH,
    subjectName: "Length",
    getNumericValue: (value: string) => value.length
})

const acceptReputationConstraint = minMaxConstraint({
    min: ACCEPT_REPUTATION_MIN,
    max: ACCEPT_REPUTATION_MAX
})

const messageReputationConstraint = minMaxConstraint({
    min: MESSAGE_REPUTATION_MIN,
    max: MESSAGE_REPUTATION_MAX
})

const messageReputationTimeoutConstraint = minMaxConstraint({
    min: MESSAGE_REPUTATION_TIMEOUT_MIN,
    max: MESSAGE_REPUTATION_TIMEOUT_MAX
})

const askChannelRateLimitConstraint = minMaxConstraint({
    min: ASK_CHANNEL_RATE_LIMIT_MIN,
    max: ASK_CHANNEL_RATE_LIMIT_MAX
})

const maxChannelsConstraint = minMaxConstraint({
    min: MAX_CHANNELS_MIN_AMOUNT,
    max: MAX_CHANNELS_MAX_AMOUNT
})

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
        useConstraint<ConfigProps, string>("resolveReaction", emojiConstraint),
        useConstraint<ConfigProps, string>("channelName", channelNameConstraint),
        useConstraint<ConfigProps, string>("deleteMessage", deleteMessageConstraint),
        useConstraint<ConfigProps, number>("acceptReputation", acceptReputationConstraint),
        useConstraint<ConfigProps, number>("messageReputation", messageReputationConstraint),
        useConstraint<ConfigProps, number>("messageReputationTimeout", messageReputationTimeoutConstraint),
        useConstraint<ConfigProps, number>("askChannelRateLimit", askChannelRateLimitConstraint),
        useConstraint<ConfigProps, number>("maxChannels", maxChannelsConstraint)
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
