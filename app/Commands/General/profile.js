const sharp = require("sharp")
const fetch = require("node-fetch")
const Command = require("../../lib/Command.js")
const User = require("../../Models/User")
const ProfileCard = require("../../Generators/ProfileCard")

async function run(args, message) {
    const user = await User.where(`user_id = '${message.author.id}' AND guild_id = '${message.guild.id}'`)
    
    if (!user) {
        return await message.channel.send("Du bist nicht registriert.")
    }

    await user.fetchDiscordUser(message.client)

    // Fetch avatar image
    const res = await fetch(user.discordUser.displayAvatarURL({ format: "png" }))
    const base64 = (await res.buffer()).toString("base64")

    const svg = new ProfileCard(user, base64).toString()
    const buffer = Buffer.from(svg, "utf-8")

    const image = await sharp(buffer).png().toBuffer()
    
    await message.channel.send("", { files: [image] })
}

module.exports = new Command(run)
    .setDescription("Zeigt dein individuelles Profil an.")
    .setAlias(["me", "rank"])