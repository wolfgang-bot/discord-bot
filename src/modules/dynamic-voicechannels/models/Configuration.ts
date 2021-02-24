import Discord from "discord.js"
import DefaultConfig from "@personal-discord-bot/shared/dist/module/Configuration"
import Context from "@personal-discord-bot/shared/dist/module/Context"
import { DescriptiveObject } from "@personal-discord-bot/shared/dist"

type ConfigProps = {
    parentChannel: Discord.CategoryChannel
    defaultChannels?: number
    channelName?: string
}

type ConfigArgs = [Discord.CategoryChannel]

type ConfigJSON = {
    parentChannelId: string
}

export default class Configuration extends DefaultConfig implements ConfigProps {
    parentChannel: Discord.CategoryChannel
    defaultChannels: number
    channelName: string

    static guildConfig = new DescriptiveObject({
        value: {
            defaultChannels: new DescriptiveObject({
                description: "Amount of persistant channels",
                value: 3
            }),

            channelName: new DescriptiveObject({
                description: "Template for the voice channel names ('{}' will be replaced with channels index)",
                value: "🔊┃voice {}"
            })
        }
    })

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
