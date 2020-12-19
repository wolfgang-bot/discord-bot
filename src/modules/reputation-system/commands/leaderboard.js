const Command = require("../../../structures/Command.js")
const LocaleServiceProvider = require("../../../services/LocaleServiceProvider.js")
const Member = require("../../../models/Member.js")
const LeaderboardEmbed = require("../embeds/LeaderboardEmbed.js")
const Guild = require("../../../models/Guild.js")

async function run(message, args) {
    const locale = (await LocaleServiceProvider.guild(message.guild)).scope("reputation-system")

    const users = await Member.whereAll(`guild_id = '${message.guild.id}' ORDER BY reputation DESC LIMIT 10`)

    await users.mapAsync(user => user.fetchDiscordUser(message.client))

    const config = await Guild.config(message.guild)

    await message.channel.send(new LeaderboardEmbed(config, locale, users))
}

module.exports = new Command(run)
    .setName("leaderboard")
    .setGroup("General")
    .setDescription("command_leaderboard_desc")
    .setAlias(["lb"])