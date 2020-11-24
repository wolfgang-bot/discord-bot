const Command = require("../../lib/Command.js")
const User = require("../../Models/User.js")
const LeaderboardEmbed = require("../../Embeds/LeaderbaordEmbed.js")
const Guild = require("../../Models/Guild.js")

async function run(message, args) {
    const users = await User.whereAll(`guild_id = '${message.guild.id}' ORDER BY reputation DESC LIMIT 10`)

    await users.mapAsync(user => user.fetchDiscordUser(message.guild.client))

    const config = await Guild.config(message.guild)

    await message.channel.send(new LeaderboardEmbed(config, users))
}

module.exports = new Command(run)
    .setDescription("Zeigt die 10 Benutzer mit der meisten Reputation an.")
    .setAlias(["lb"])