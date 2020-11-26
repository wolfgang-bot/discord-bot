const Command = require("../../../lib/Command.js")
const Member = require("../../../Models/Member.js")
const LeaderboardEmbed = require("../Embeds/LeaderbaordEmbed.js")
const Guild = require("../../../Models/Guild.js")

async function run(message, args) {
    const users = await Member.whereAll(`guild_id = '${message.guild.id}' ORDER BY reputation DESC LIMIT 10`)

    await users.mapAsync(user => user.fetchDiscordUser(message.client))

    const config = await Guild.config(message.guild)

    await message.channel.send(new LeaderboardEmbed(config, users))
}

module.exports = new Command(run)
    .setName("leaderboard")
    .setGroup("General")
    .setDescription("Zeigt die 10 Benutzer mit der meisten Reputation an.")
    .setAlias(["lb"])