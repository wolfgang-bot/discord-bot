import Discord from "discord.js"
import DefaultConfig, { Validator } from "../../../lib/Configuration"

const MAX_AMOUNT_OF_CHANNELS = 20

type ConfigProps = {
    parentChannel: Discord.CategoryChannel
    defaultChannels: number
    channelName: string
}

export default class Configuration extends DefaultConfig implements ConfigProps {
    parentChannel: Discord.CategoryChannel
    defaultChannels: number
    channelName: string

    static validators: Validator<ConfigProps>[] = [
        {
            key: "defaultChannels",
            validate: (props) => props.defaultChannels > 0,
            message: "Must be greater than 0"
        },
        {
            key: "defaultChannels",
            validate: (props) => props.defaultChannels <= MAX_AMOUNT_OF_CHANNELS,
            message: `Cannot be larger than ${MAX_AMOUNT_OF_CHANNELS}`
        },
        {
            key: "channelName",
            validate: (props) => props.channelName.length > 0,
            message: "Cannot be empty"
        }
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
