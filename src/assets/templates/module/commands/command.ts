import Discord from "discord.js"
import Command from "../../../lib/Command"

export default class MyCommand extends Command {
    name = "command"
    group = "General"
    description = "Sends back 'Hello World!'"
    alias = ["cmd"]

    async run(message: Discord.Message, args: string[]) {
        await message.channel.send("Hello World!")
    }
}