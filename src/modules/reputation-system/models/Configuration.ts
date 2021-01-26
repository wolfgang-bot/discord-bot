import Discord from "discord.js"
import DefaultConfig from "../../../lib/Configuration"
import Context from "../../../lib/Context"

type ConfigProps = {
    channel: Discord.TextChannel
    roles?: string[]
    roleColors?: string[]
    roleThresholds?: number[]
    levelUpReactionEmoji?: string
}

type ConfigArgs = [Discord.TextChannel]

type ConfigJSON = {
    channelId: string
}

export default class Configuration extends DefaultConfig implements ConfigProps {
    channel: Discord.TextChannel
    roles: string[] = ["Bronze", "Silber", "Gold", "Platin", "Diamant"]
    roleColors: string[] = ["#E67E22", "#ffffff", "#F0C410", "#607d8b", "#3498DB"]
    roleThresholds: number[] = [10, 100, 500, 1000, 2500]
    levelUpReactionEmoji: string = "Emoji of the reaction which is added to the 'level up' announcements"

    static fromArgs(args: ConfigArgs) {
        return new Configuration({ channel: args[0] })
    }

    static async fromJSON(context: Context, object: ConfigJSON) {
        const channel = await context.guild.channels.cache.get(object.channelId) as Discord.TextChannel
        return new Configuration({ channel })
    }

    constructor(props: ConfigProps) {
        super(props)
        this.channel = props.channel
    }

    toJSON(): ConfigJSON {
        return {
            channelId: this.channel.id
        }
    }
}