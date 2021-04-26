import Discord from "discord.js"
import DefaultConfig, { Validator } from "../../../lib/Configuration"
import { channelNameConstraint, minMaxConstraint, useConstraint } from "../../../lib/constraints"

const DEFAULT_CHANNELS_MIN_AMOUNT = 1
const DEFAULT_CHANNELS_MAX_AMOUNT = 20

type ConfigProps = {
    parentChannel: Discord.CategoryChannel
    defaultChannels: number
    channelName: string
}

const defaultChannelsConstraint = minMaxConstraint({
    min: DEFAULT_CHANNELS_MIN_AMOUNT,
    max: DEFAULT_CHANNELS_MAX_AMOUNT
})

export default class Configuration extends DefaultConfig implements ConfigProps {
    parentChannel: Discord.CategoryChannel
    defaultChannels: number
    channelName: string

    static validators: Validator<ConfigProps>[] = [
        useConstraint<ConfigProps, number>("defaultChannels", defaultChannelsConstraint),
        useConstraint<ConfigProps, string>("channelName", channelNameConstraint),
    ]

    constructor(props: ConfigProps) {
        super(props)
        Configuration.validate(props)
    }

    toJSON() {
        return {
            ...this,
            parentChannel: this.parentChannel.id
        }
    }
}
