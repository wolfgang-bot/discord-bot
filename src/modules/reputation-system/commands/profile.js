const sharp = require("sharp")
const fetch = require("node-fetch")
const Command = require("../../../lib/Command.js")
const ProfileCard = require("../generators/ProfileCard")
const Member = require("../../../models/Member.js")
const Guild = require("../../../models/Guild.js")

async function run(message, args) {
    const member = await Member.where(`user_id = '${message.author.id}' AND guild_id = '${message.guild.id}'`)
    
    if (!member) {
        return await message.channel.send("Du bist nicht registriert.")
    }

    await member.fetchDiscordUser(message.client)
    
    const config = await Guild.config(message.guild)

    // Fetch avatar image
    const res = await fetch(member.discordUser.displayAvatarURL({ format: "png" }))
    const base64 = (await res.buffer()).toString("base64")

    const svg = new ProfileCard(config, member, base64).toString()
    const buffer = Buffer.from(svg, "utf-8")

    const image = await sharp(buffer).png().toBuffer()
    
    await message.channel.send("", { files: [image] })
}

module.exports = new Command(run)
    .setName("profile")
    .setGroup("General")
    .setDescription("command_profile_desc")
    .setAlias(["me", "rank"])