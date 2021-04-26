import Discord from "discord.js"
import DefaultConfig, { Validator } from "../../../lib/Configuration"
import { discordColorConstraint, minMaxConstraint, noDuplicatesConstraint, useConstraint } from "../../../lib/constraints"

const EMOJI_PREFIX_MIN_LENGTH = 0
const EMOJI_PREFIX_MAX_LENGTH = 20

type ConfigProps = {
    channel: Discord.TextChannel,
    emojiPrefix: string,
    roleColor: string,
    roles: string[]
}

const emojiPrefixConstraint = minMaxConstraint({
    min: EMOJI_PREFIX_MIN_LENGTH,
    max: EMOJI_PREFIX_MAX_LENGTH,
    subjectName: "Length",
    getNumericValue: (value: string) => value.length
})

export default class Configuration extends DefaultConfig implements ConfigProps {
    channel: Discord.TextChannel
    emojiPrefix: string
    roleColor: string
    roles: string[]

    static validators: Validator<ConfigProps>[] = [
        useConstraint<ConfigProps, string>("emojiPrefix", emojiPrefixConstraint),
        useConstraint<ConfigProps, string>("roleColor", discordColorConstraint),
        useConstraint<ConfigProps, string[]>("roles", noDuplicatesConstraint)
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
