import Discord from "discord.js"
import DefaultConfig from "../../../lib/Configuration"

type ConfigProps = {
    parentChannel: Discord.CategoryChannel
    defaultChannels: number
    channelName: string
}

export default class Configuration extends DefaultConfig implements ConfigProps {
    parentChannel: Discord.CategoryChannel
    defaultChannels: number
    channelName: string
    
    constructor(props: ConfigProps) {
        super(props)

        if (this.defaultChannels <= 0) {
            throw "Amount of voicechannels must be greater than 0"
        }
    }

    toJSON() {
        return {
            ...this,
            parentChannel: this.parentChannel.id
        }
    }
}
