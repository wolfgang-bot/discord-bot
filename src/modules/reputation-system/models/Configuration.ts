import Discord from "discord.js"
import DefaultConfig from "../../../lib/Configuration"
import Context from "../../../lib/Context"
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

type ConfigArgs = [
    Discord.TextChannel,
    string[],
    string[],
    number[],
    string
]

type ConfigJSON = {
    channelId: string,
    roles: string[],
    roleColors: string[],
    roleThresholds: number[],
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

    static fromArgs([
        channel,
        roles,
        roleColors,
        roleThresholds,
        levelUpReactionEmoji
    ]: ConfigArgs) {
        if (!hasSameLength(roles, roleColors, roleThresholds)) {
            throw "roles, role_colors and role_thresholds must have the same length"
        }

        if (!everyGreaterThanZero(roleThresholds)) {
            throw "Role thresholds must be greater than 0"
        }

        if (!everyGreaterThanPreceeding(roleThresholds)) {
            throw "Every role threshold must be greater than the preceeding one"
        }

        if (!emojiConstraint.verifyConstraints(levelUpReactionEmoji)) {
            throw emojiConstraint.constraints
        }

        return new Configuration({
            channel,
            roles,
            roleColors,
            roleThresholds,
            levelUpReactionEmoji
        })
    }

    static async fromJSON(context: Context, {
        channelId,
        ...values
    }: ConfigJSON) {
        const channel = context.guild.channels.cache.get(channelId) as Discord.TextChannel
        return new Configuration({ channel, ...values })
    }

    constructor(props: ConfigProps) {
        super(props)

        this.channel = props.channel
        this.roles = props.roles
        this.roleColors = props.roleColors
        this.roleThresholds = props.roleThresholds
        this.levelUpReactionEmoji = props.levelUpReactionEmoji
    }

    toJSON(): ConfigJSON {
        return {
            channelId: this.channel.id,
            roles: this.roles,
            roleColors: this.roleColors,
            roleThresholds: this.roleThresholds,
            levelUpReactionEmoji: this.levelUpReactionEmoji
        }
    }
}
