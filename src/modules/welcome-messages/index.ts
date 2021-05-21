import Discord from "discord.js"
import { module, argument } from "../../lib/decorators"
import Module from "../../lib/Module"
import { TYPES as ARGUMENT_TYPES } from "../../lib/Argument"
import Configuration from "./models/Configuration"
import Context from "../../lib/Context"
import { pickRandomFromArray } from "../../utils"

@module({
    key: "welcome-messages",
    position: 1,
    name: "Welcome Messages",
    desc: "Sends custom welcome messages",
    features: [
        "Sends a random welcome message into a textchannel when a user joins the guild."
    ]
})
@argument({
    type: ARGUMENT_TYPES.TEXT_CHANNEL,
    key: "channel",
    name: "Channel",
    desc: "The channel in which the messages will be sent"
})
@argument({
    type: ARGUMENT_TYPES.STRING,
    isArray: true,
    key: "messages",
    name: "Messages",
    desc: "The custom welcome messages ({} will be replaced by the username)",
    defaultValue: [
        "Welcome {} to our server!"
    ]
})
export default class WelcomeMessagesModule extends Module {
    static config = Configuration

    config: Configuration

    constructor(context: Context, config: Configuration) {
        super(context, config)

        this.handleGuildMemberAdd = this.handleGuildMemberAdd.bind(this)
    }

    async start() {
        this.context.client.addListener("guildMemberAdd", this.handleGuildMemberAdd)
    }

    async stop() {
        this.context.client.removeListener("guildMemberAdd", this.handleGuildMemberAdd)
    }

    handleGuildMemberAdd(member: Discord.GuildMember) {
        const message = this.parseMessage(
            pickRandomFromArray(this.config.messages),
            member
        )
        this.config.channel.send(message)
    }

    parseMessage(message: string, member: Discord.GuildMember) {
        return message.replace(/{}/g, `<@${member.user.id}>`)
    }
}
