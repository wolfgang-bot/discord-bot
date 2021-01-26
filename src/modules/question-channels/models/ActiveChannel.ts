import Discord from "discord.js"

export type ActiveChannelProps = {
    channel: Discord.TextChannel
    message: Discord.Message
    user: Discord.User
}

export type ActiveChannelJSON = {
    channelId: string
    messageId: string
    userId: string
}

class ActiveChannel implements ActiveChannelProps {
    channel: Discord.TextChannel
    message: Discord.Message
    user: Discord.User

    constructor(props: ActiveChannelProps) {
        this.channel = props.channel
        this.message = props.message
        this.user = props.user
    }

    toJSON(): ActiveChannelJSON {
        return {
            channelId: this.channel.id,
            messageId: this.message.id,
            userId: this.user.id
        }
    }
}

export default ActiveChannel