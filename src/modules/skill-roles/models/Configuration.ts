import Discord from "discord.js"
import DefaultConfig, { Validator } from "../../../lib/Configuration"
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

    static validators: Validator<ConfigProps>[] = [
        {
            key: "roleColor",
            validate: (props) => COLOR_REGEX.test(props.roleColor),
            message: "Must be a valid color code"
        },
        {
            key: "roles",
            validate: (props) => !hasDuplicates(props.roles),
            message: "Cannot contain duplicates"
        }
    ]
    
    constructor(props: ConfigProps) {
        super(props)
        Configuration.validate(props)
    }

    toJSON() {
        return {
            ...this,
            channel: this.channel.id
        }
    }
}
