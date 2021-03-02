import Discord from "discord.js"
import DefaultConfig from "../../../lib/Configuration"
import Context from "../../../lib/Context"
import DescriptiveObject from "../../../lib/DescriptiveObject"

type ConfigProps = {
    parentChannel: Discord.CategoryChannel
    defaultChannels: number
    channelName?: string
}

type ConfigArgs = [Discord.CategoryChannel, number]

type ConfigJSON = {
    parentChannelId: string,
    defaultChannels: number
}

export default class Configuration extends DefaultConfig implements ConfigProps {
    parentChannel: Discord.CategoryChannel
    defaultChannels: number
    channelName: string

    static guildConfig = new DescriptiveObject({
        value: {
            channelName: new DescriptiveObject({
                description: "Template for the voice channel names ('{}' will be replaced with channels index)",
                value: "🔊┃voice {}"
            })
        }
    })

    static fromArgs([parentChannel, defaultChannels]: ConfigArgs) {
        if (defaultChannels <= 0) {
            throw new Error("Amount of voicechannels must be greater than 0")
        }

        return new Configuration({ parentChannel, defaultChannels })
    }

    static async fromJSON(context: Context, {
        parentChannelId,
        defaultChannels
    }: ConfigJSON) {
        const parentChannel = context.guild.channels.cache.get(parentChannelId) as Discord.CategoryChannel
        return new Configuration({ parentChannel, defaultChannels })
    }
    
    constructor(props: ConfigProps) {
        super(props)
        this.parentChannel = props.parentChannel
        this.defaultChannels = props.defaultChannels
    }

    toJSON(): ConfigJSON {
        return {
            parentChannelId: this.parentChannel.id,
            defaultChannels: this.defaultChannels
        }
    }
}
