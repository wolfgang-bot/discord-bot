import Discord from "discord.js"
import DefaultConfig from "../../../lib/Configuration"
import Context from "../../../lib/Context"
import DescriptiveObject from "../../../lib/DescriptiveObject"
import { COLOR_REGEX } from "../../../lib/constraints"

function hasDuplicates(array: any[]) {
    return new Set(array).size !== array.length
}

type ConfigProps = {
    roleMessage?: Discord.Message,
    channel: Discord.TextChannel,
    emojiPrefix: string,
    roleColor: string,
    roles: string[]
}

type ConfigArgs = [Discord.TextChannel, string, string, string[]]

type ConfigJSON = {
    roleMessageId: string,
    channelId: string,
    emojiPrefix: string,
    roleColor: string,
    roles: string[]
}

export default class Configuration extends DefaultConfig implements ConfigProps {
    roleMessage: Discord.Message
    channel: Discord.TextChannel
    emojiPrefix: string
    roleColor: string
    roles: string[]

    static guildConfig = new DescriptiveObject({
        value: {}
    })

    static fromArgs([channel, emojiPrefix, roleColor, roles]: ConfigArgs) {
        if (!COLOR_REGEX.test(roleColor)) {
            throw "'Role Color' must be a valid color code"
        }

        if (hasDuplicates(roles)) {
            throw "'Roles' cannot contain duplicates"
        }

        return new Configuration({ channel, emojiPrefix, roleColor, roles })
    }

    static async fromJSON(context: Context, {
        channelId,
        roleMessageId,
        ...json
    }: ConfigJSON) {
        const channel = context.guild.channels.cache.get(channelId) as Discord.TextChannel
        const roleMessage = await channel.messages.fetch(roleMessageId)
        return new Configuration({ channel, roleMessage, ...json })
    }

    constructor(props: ConfigProps) {
        super(props)
        this.channel = props.channel
        this.roleMessage = props.roleMessage
        this.emojiPrefix = props.emojiPrefix
        this.roleColor = props.roleColor
        this.roles = props.roles
    }

    toJSON(): ConfigJSON {
        return {
            channelId: this.channel.id,
            roleMessageId: this.roleMessage.id,
            emojiPrefix: this.emojiPrefix,
            roleColor: this.roleColor,
            roles: this.roles
        }
    }
}
