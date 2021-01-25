import * as Discord from "discord.js"
import DefaultConfig from "../../../lib/Configuration"
import Context from "../../../lib/Context"

type ConfigProps = {
    channel: Discord.TextChannel
    roleMessage?: Discord.Message
    emojiPrefix?: string
    roleColor?: string
    roles?: string[]
}

type ConfigArgs = [Discord.TextChannel]

type ConfigJSON = {
    channelId: string
    roleMessageId: string
}

export default class Configuration extends DefaultConfig implements ConfigProps {
    channel: Discord.TextChannel
    roleMessage: Discord.Message
    emojiPrefix: string = "skill_"
    roleColor: string = "AQUA"
    roles: string[] = [
        "Javascript",
        "Python",
        "React",
        "Vue",
        "Angular",
        "Linux",
        "Java",
        "Cpp"
    ]

    static fromArgs(args: ConfigArgs) {
        return new Configuration({ channel: args[0] })
    }

    static async fromJSON(context: Context, object: ConfigJSON) {
        const channel = context.guild.channels.cache.get(object.channelId) as Discord.TextChannel
        const roleMessage = await channel.messages.fetch(object.roleMessageId)
        return new Configuration({ channel, roleMessage })
    }

    constructor(props: ConfigProps) {
        super(props)
        this.channel = props.channel
        this.roleMessage = props.roleMessage
    }

    toJSON(): ConfigJSON {
        return {
            channelId: this.channel.id,
            roleMessageId: this.roleMessage.id
        }
    }
}