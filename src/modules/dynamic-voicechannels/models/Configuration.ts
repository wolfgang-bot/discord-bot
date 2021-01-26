import Discord from "discord.js"
import DefaultConfig from "../../../lib/Configuration"
import Context from "../../../lib/Context"

type ConfigProps = {
    parentChannel: Discord.CategoryChannel
    defaultChannels?: number
    channelName?: string
}

type ConfigArgs = [Discord.CategoryChannel]

type ConfigJSON = {
    parentChannelId: string
}

class Configuration extends DefaultConfig implements ConfigProps {
    parentChannel: Discord.CategoryChannel
    defaultChannels: number = 3
    channelName: string = "🔊┃voice {}"

    static fromArgs(args: ConfigArgs) {
        return new Configuration({ parentChannel: args[0] })
    }

    static async fromJSON(context: Context, object: ConfigJSON) {
        const parentChannel = context.guild.channels.cache.get(object.parentChannelId) as Discord.CategoryChannel
        return new Configuration({ parentChannel })
    }
    
    constructor(props: ConfigProps) {
        super(props)
        this.parentChannel = props.parentChannel
    }

    toJSON(): ConfigJSON {
        return {
            parentChannelId: this.parentChannel.id
        }
    }
}

export default Configuration