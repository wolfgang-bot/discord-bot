import Discord from "discord.js"
import Command from "../../../lib/Command"
import Collection from "../../../lib/Collection"
import LocaleProvider from "../../../services/LocaleProvider"
import Member from "../../../models/Member"
import LeaderboardEmbed from "../embeds/LeaderboardEmbed"
import ModuleInstance from "../../../models/ModuleInstance"
import SettingsConfig from "../../settings/models/Configuration"

export default class LeaderboardCommand extends Command {
    name = "leaderboard"
    group = "General"
    description = "command_leaderboard_desc"
    alias = ["lb"]

    async run(message: Discord.Message) {
        const locale = (await LocaleProvider.guild(message.guild)).scope("reputation-system")

        const members = await Member.whereAll(`guild_id = '${message.guild.id}' ORDER BY reputation DESC LIMIT 10`) as Collection<Member>

        await members.mapAsync(member => member.fetchDiscordUser(message.client))

        const settings = await ModuleInstance.config(message.guild, "settings") as SettingsConfig

        await message.channel.send(new LeaderboardEmbed(settings, locale, members))
    }
}
