import Discord from "discord.js"
import path from "path"
import glob from "glob-promise"
import DefaultConfig from "../../../lib/Configuration"
import Context from "../../../lib/Context"
import DescriptiveObject from "../../../lib/DescriptiveObject"
import { COLOR_REGEX } from "../../../lib/constraints"

const ICONS_DIR = path.join(__dirname, "..", "modules", "skill-roles", "assets", "icons")

const icons = glob.sync("*.png", { cwd: ICONS_DIR }).map(filename => filename.replace(".png", ""))

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
    emojiPrefix: string
    roleColor: string
    roles: string[]

    static guildConfig = new DescriptiveObject({
        value: {
            emojiPrefix: new DescriptiveObject({
                description: "Prefix of the role names",
                value: "skill_"
            }),

            roleColor: new DescriptiveObject({
                description: "Color of the roles (Discord color names allowed)",
                value: "AQUA",
                constraints: "Must be a valid color",
                verifyConstraints: (value: string) => COLOR_REGEX.test(value)
            }),

            roles: new DescriptiveObject({
                description: "Names of the roles which will be created",
                value: [
                    "Javascript",
                    "Python",
                    "React",
                    "Vue",
                    "Angular",
                    "Linux",
                    "Java",
                    "Cpp"
                ],
                constraints: `Available roles: ${icons.map(e => `'${e}'`).join(", ")}`,
                verifyConstraints: (value: string[]) => (
                    value.length > 0 &&
                    value.every(name => icons.includes(name.toLowerCase()))
                )
            })
        }
    })

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