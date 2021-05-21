import Discord from "discord.js"
import DefaultConfig, { Validator } from "../../../lib/Configuration"
import { minMaxConstraint, useConstraint } from "../../../lib/constraints"

const MIN_AMOUNT_MESSAGES = 1
const MAX_AMOUNT_MESSAGES = 20

const MIN_MESSAGE_LENGTH = 3
const MAX_MESSAGE_LENGTH = 200

type ConfigProps = {
    channel: Discord.TextChannel,
    messages: string[]
}

const messagesAmountConstraint = minMaxConstraint({
    min: MIN_AMOUNT_MESSAGES,
    max: MAX_AMOUNT_MESSAGES,
    subjectName: "Length",
    getNumericValue: (value: string[]) => value.length
})

export default class Configuration extends DefaultConfig implements ConfigProps {
    channel: Discord.TextChannel
    messages: string[]

    static validators: Validator<ConfigProps>[] = [
        useConstraint<ConfigProps, string[]>("messages", messagesAmountConstraint),
        {
            key: "messages",
            validate: ({ messages }) =>
                messages.every(message =>
                    message.length >= MIN_MESSAGE_LENGTH &&
                    message.length <= MAX_MESSAGE_LENGTH),
            message: `Messages must be between ${MIN_MESSAGE_LENGTH} and ${MAX_MESSAGE_LENGTH} characters long`
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
