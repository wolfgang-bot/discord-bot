import Discord from "discord.js"
import DefaultConfig from "../../../lib/Configuration"
import DescriptiveObject from "../../../lib/DescriptiveObject"

type ConfigProps = {
    parentChannel: Discord.CategoryChannel
    defaultChannels: number
    channelName: string
}

export default class Configuration extends DefaultConfig implements ConfigProps {
    parentChannel: Discord.CategoryChannel
    defaultChannels: number
    channelName: string

    static guildConfig = new DescriptiveObject({
        value: {}
    })
    
    constructor(props: ConfigProps) {
        super(props)

        this.parentChannel = props.parentChannel
        this.defaultChannels = props.defaultChannels
        this.channelName = props.channelName

        if (this.defaultChannels <= 0) {
            throw "Amount of voicechannels must be greater than 0"
        }
    }
}
