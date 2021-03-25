import Discord from "discord.js"
import DefaultConfig, { Validator } from "../../../lib/Configuration"
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

    static validators: Validator<ConfigProps>[] = [
        {
            key: "resolveReaction",
            validate: (props) => emojiConstraint.verifyConstraints(props.resolveReaction),
            message: emojiConstraint.constraints
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
