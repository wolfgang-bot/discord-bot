import Discord from "discord.js"
import DefaultConfig, { Validator } from "../../../lib/Configuration"
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

    static validators: Validator<ConfigProps>[] = [
        {
            key: "roles",
            validate: (props) => hasSameLength(props.roles, props.roleColors, props.roleThresholds),
            message: "'Roles', 'Role Colors' and 'Role Thresholds' must have the same length"
        },
        {
            key: "roleColors",
            validate: (props) => hasSameLength(props.roles, props.roleColors, props.roleThresholds),
            message: "'Roles', 'Role Colors' and 'Role Thresholds' must have the same length"
        },
        {
            key: "roleThresholds",
            validate: (props) => hasSameLength(props.roles, props.roleColors, props.roleThresholds),
            message: "'Roles', 'Role Colors' and 'Role Thresholds' must have the same length"
        },
        {
            key: "roleThresholds",
            validate: (props) => everyGreaterThanZero(props.roleThresholds),
            message: "Each value must be greater than 0"
        },
        {
            key: "roleThresholds",
            validate: (props) => everyGreaterThanPreceeding(props.roleThresholds),
            message: "Each value must be greater than the preceeding one"
        },
        {
            key: "levelUpReactionEmoji",
            validate: (props) => emojiConstraint.verifyConstraints(props.levelUpReactionEmoji),
            message: emojiConstraint.constraints
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
