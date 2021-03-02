import Discord from "discord.js"
import DefaultConfig from "../../../lib/Configuration"
import Context from "../../../lib/Context"
import DescriptiveObject from "../../../lib/DescriptiveObject"

type ConfigProps = {
    parentChannel: Discord.CategoryChannel
    defaultChannels: number
    channelName: string
}

type ConfigArgs = [Discord.CategoryChannel, number, string]

type ConfigJSON = {
    parentChannelId: string,
    defaultChannels: number,
    channelName: string
}

export default class Configuration extends DefaultConfig implements ConfigProps {
    parentChannel: Discord.CategoryChannel
    defaultChannels: number
    channelName: string

    static guildConfig = new DescriptiveObject({
        value: {}
    })

    static fromArgs([parentChannel, defaultChannels, channelName]: ConfigArgs) {
        if (defaultChannels <= 0) {
            throw "Amount of voicechannels must be greater than 0"
        }

        return new Configuration({
            parentChannel,
            defaultChannels,
            channelName
        })
    }

    static async fromJSON(context: Context, {
        parentChannelId,
        defaultChannels,
        channelName
    }: ConfigJSON) {
        const parentChannel = context.guild.channels.cache.get(parentChannelId) as Discord.CategoryChannel
        return new Configuration({
            parentChannel,
            defaultChannels,
            channelName
        })
    }
    
    constructor(props: ConfigProps) {
        super(props)
        this.parentChannel = props.parentChannel
        this.defaultChannels = props.defaultChannels
        this.channelName = props.channelName
    }

    toJSON(): ConfigJSON {
        return {
            parentChannelId: this.parentChannel.id,
            defaultChannels: this.defaultChannels,
            channelName: this.channelName
        }
    }
}
