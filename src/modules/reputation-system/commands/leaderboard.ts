import Discord from "discord.js"
import Collection from "@personal-discord-bot/shared/dist/orm/Collection"
import Command from "@personal-discord-bot/shared/dist/command/Command"
import { LocaleProvider } from "@personal-discord-bot/shared/dist"
import Member from "@personal-discord-bot/shared/dist/models/Member"
import LeaderboardEmbed from "../embeds/LeaderboardEmbed"
import Guild from "@personal-discord-bot/shared/dist/models/Guild"

export default class LeaderboardCommand extends Command {
    name = "leaderboard"
    group = "General"
    description = "command_leaderboard_desc"
    alias = ["lb"]

    async run(message: Discord.Message) {
        const locale = (await LocaleProvider.guild(message.guild)).scope("reputation-system")

        const members = await Member.whereAll(`guild_id = '${message.guild.id}' ORDER BY reputation DESC LIMIT 10`) as Collection<Member>

        await members.mapAsync(member => member.fetchDiscordUser(message.client))

        const config = await Guild.config(message.guild)

        await message.channel.send(new LeaderboardEmbed(config, locale, members))
    }
}
