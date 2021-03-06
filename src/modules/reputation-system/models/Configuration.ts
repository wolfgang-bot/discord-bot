import Discord from "discord.js"
import DefaultConfig from "../../../lib/Configuration"
import DescriptiveObject from "../../../lib/DescriptiveObject"
import { emojiConstraint } from "../../../lib/constraints"

function hasSameLength(...arrays: any[][]) {
    return arrays.some(array => !arrays.some(
        _array => array.length !== _array.length
    ))
}

function everyGreaterThanZero(array: number[]) {
    return array.every(value => value > 0)
}

function everyGreaterThanPreceeding(array: number[]) {
    return array.every((value, i) => (
        i === 0 ? true : value > array[i - 1]
    ))
}

type ConfigProps = {
    channel: Discord.TextChannel
    roles: string[]
    roleColors: string[]
    roleThresholds: number[]
    levelUpReactionEmoji: string
}

export default class Configuration extends DefaultConfig implements ConfigProps {
    channel: Discord.TextChannel
    roles: string[]
    roleColors: string[]
    roleThresholds: number[]
    levelUpReactionEmoji: string

    static guildConfig = new DescriptiveObject({
        value: {}
    })

    constructor(props: ConfigProps) {
        super(props)

        this.channel = props.channel
        this.roles = props.roles
        this.roleColors = props.roleColors
        this.roleThresholds = props.roleThresholds
        this.levelUpReactionEmoji = props.levelUpReactionEmoji

        if (!hasSameLength(this.roles, this.roleColors, this.roleThresholds)) {
            throw "roles, role_colors and role_thresholds must have the same length"
        }

        if (!everyGreaterThanZero(this.roleThresholds)) {
            throw "Role thresholds must be greater than 0"
        }

        if (!everyGreaterThanPreceeding(this.roleThresholds)) {
            throw "Every role threshold must be greater than the preceeding one"
        }

        if (!emojiConstraint.verifyConstraints(this.levelUpReactionEmoji)) {
            throw emojiConstraint.constraints
        }
    }

    toJSON() {
        return {
            ...this,
            channel: this.channel.id
        }
    }
}
