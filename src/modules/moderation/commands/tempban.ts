import Discord, { DiscordAPIError } from "discord.js"
import CustomCommand from "../CustomCommand"
import LocaleProvider from "../../../services/LocaleProvider"
import { getUserIdFromMention } from "../../../utils"

const MILLISECONDS_PER_HOUR = 1000 * 3600
const MIN_HOURS = 0.01
const MAX_HOURS = 24 * 14

export default class TempbanCommand extends CustomCommand {
    name = "tempban"
    group = "Moderation"
    permissions: Discord.PermissionString[] = ["BAN_MEMBERS"]
    description = "command_tempban_desc"
    arguments = "command_tempban_args"

    async run(message: Discord.Message, args: string[]) {
        const locale = (await LocaleProvider.guild(message.guild)).scope(this.getModule())

        if (!args[0]) {
            throw locale.translate("error_missing_arg", "user")
        }

        if (!args[1]) {
            throw locale.translate("error_missing_arg", "hours")
        }

        const hours = parseFloat(args[1])

        if (!Number.isFinite(hours)) {
            throw locale.translate("error_invalid_duration")
        }
        
        if (hours < MIN_HOURS || hours > MAX_HOURS) {
            throw locale.translate(
                "error_duration_between",
                MIN_HOURS, MIN_HOURS * 60,
                MAX_HOURS, MAX_HOURS / 24,
            )
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
        
        await message.guild.members.ban(user)

        const timestamp = Date.now() + hours * MILLISECONDS_PER_HOUR
        await this.scheduler.scheduleUnban(user.id, timestamp)

        await message.react("👍")
    }
}
