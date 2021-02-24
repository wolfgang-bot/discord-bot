import Discord from "discord.js"
import DefaultConfig from "@personal-discord-bot/shared/dist/module/Configuration"
import { Context } from "@personal-discord-bot/shared/dist/module"
import { DescriptiveObject } from "@personal-discord-bot/shared/dist"
import { emojiConstraint } from "@personal-discord-bot/shared/dist/constraints"

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
    roles: string[]
    roleColors: string[]
    roleThresholds: number[]
    levelUpReactionEmoji: string

    static guildConfig = new DescriptiveObject({
        value: {
            roles: new DescriptiveObject({
                description: "Level Roles which are assigned to a user who reaches the level",
                value: ["Bronze", "Silber", "Gold", "Platin", "Diamant"],
                constraints: "Must have the same amount of items as 'Role Colors' and 'Role Thresholds'",
                verifyConstraints: (value: string[], config) => (
                    value.length > 0 &&
                    value.length === config["reputation-system"].roleColors.length &&
                    value.length === config["reputation-system"].roleThresholds.length
                )
            }),

            roleColors: new DescriptiveObject({
                description: "Color of each level role",
                value: ["#E67E22", "#ffffff", "#F0C410", "#607d8b", "#3498DB"],
                constraints: "Must have the same amount of items as 'Roles' and 'Role Thresholds'",
                verifyConstraints: (value: string[], config) => (
                    value.length > 0 &&
                    value.length === config["reputation-system"].roles.length &&
                    value.length === config["reputation-system"].roleThresholds.length
                )
            }),

            roleThresholds: new DescriptiveObject({
                description: "Amount of reputation needed to reach the levels",
                value: [10, 100, 500, 1000, 2500],
                constraints: "Must have the same amount of items as 'Roles' and 'Role Colors'",
                verifyConstraints: (value: string[], config) => (
                    value.length > 0 &&
                    value.length === config["reputation-system"].roles.length &&
                    value.length === config["reputation-system"].roleColors.length
                )
            }),

            levelUpReactionEmoji: new DescriptiveObject({
                description: "Emoji of the reaction which is added to the 'level up' announcements",
                value: "💯",
                ...emojiConstraint
            })
        }
    })

    static fromArgs(args: ConfigArgs) {
        return new Configuration({ channel: args[0] })
    }

    static async fromJSON(context: Context, object: ConfigJSON) {
        const channel = context.guild.channels.cache.get(object.channelId) as Discord.TextChannel
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
