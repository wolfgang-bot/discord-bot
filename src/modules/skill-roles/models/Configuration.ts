import Discord from "discord.js"
import DefaultConfig from "../../../lib/Configuration"
import DescriptiveObject from "../../../lib/DescriptiveObject"
import { COLOR_REGEX } from "../../../lib/constraints"

function hasDuplicates(array: any[]) {
    return new Set(array).size !== array.length
}

type ConfigProps = {
    channel: Discord.TextChannel,
    emojiPrefix: string,
    roleColor: string,
    roles: string[]
}
export default class Configuration extends DefaultConfig implements ConfigProps {
    channel: Discord.TextChannel
    emojiPrefix: string
    roleColor: string
    roles: string[]

    static guildConfig = new DescriptiveObject({
        value: {}
    })
    
    constructor(props: ConfigProps) {
        super(props)

        if (!COLOR_REGEX.test(this.roleColor)) {
            throw "'Role Color' must be a valid color code"
        }

        if (hasDuplicates(this.roles)) {
            throw "'Roles' cannot contain duplicates"
        }
    }

    toJSON() {
        return {
            ...this,
            channel: this.channel.id
        }
    }
}
