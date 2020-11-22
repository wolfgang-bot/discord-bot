const Command = require("../../lib/Command.js")
const User = require("../../Models/User.js")
const LeaderboardEmbed = require("../../Embeds/LeaderbaordEmbed.js")

async function run(args, message) {
    const users = await User.where("1 ORDER BY reputation DESC LIMIT 10")

    await users.mapAsync(user => user.fetchDiscordUser(message.guild.client))

    await message.channel.send(new LeaderboardEmbed(users))
}

module.exports = new Command(run)
    .setDescription("Zeigt die 10 Benutzer mit der meisten Reputation an.")
    .setAlias(["lb"])