import Discord, { DiscordAPIError } from "discord.js"
import CustomCommand from "../CustomCommand"
import LocaleProvider from "../../../services/LocaleProvider"
import { getUserIdFromMention } from "../../../utils"

export default class MuteCommand extends CustomCommand {
    name = "mute"
    group = "Moderation"
    permissions: Discord.PermissionString[] = ["MANAGE_GUILD"]
    description = "command_mute_desc"
    arguments = "command_mute_args"

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

        const member = await message.guild.members.fetch(user)
        await this.muter.muteMember(member)
        await message.react("👍")
    }
}
