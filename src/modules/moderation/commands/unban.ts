import Discord, { DiscordAPIError } from "discord.js"
import Command from "../../../lib/Command"
import LocaleProvider from "../../../services/LocaleProvider"
import { getUserIdFromMention } from "../../../utils"

export default class UnbanCommand extends Command {
    name = "unban"
    group = "Moderation"
    permissions: Discord.PermissionString[] = ["BAN_MEMBERS"]
    description = "command_unban_desc"
    arguments = "command_unban_args"

    async run(message: Discord.Message, args: string[]) {
        const locale = (await LocaleProvider.guild(message.guild)).scope(this.getModule())

        if (!args[0]) {
            throw locale.translate("error_missing_arg", "user")
        }

        const id = getUserIdFromMention(args[0])

        let user: Discord.User
        try {
            user = await message.client.users.fetch(id)
        } catch (error) {
            if (error instanceof DiscordAPIError && error.httpStatus === 404) {
                throw locale.translate("error_user_not_found")
            }
            throw error
        }

        await message.guild.members.unban(user)
        await message.react("👍")
    }
}
