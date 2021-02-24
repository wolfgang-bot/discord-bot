import Discord from "discord.js"
import sharp from "sharp"
import fetch from "node-fetch"
import { Command } from "@personal-discord-bot/shared/dist/command"
import ProfileCard from "../profile-card"
import Member from "@personal-discord-bot/shared/dist/models/Member"
import Guild from "@personal-discord-bot/shared/dist/models/Guild"

export default class ProfileCommand extends Command {
    name = "profile"
    group = "General"
    description = "command_profile_desc"
    alias = ["me", "rank"]

    async run(message: Discord.Message) {
        const member = await Member.where(`user_id = '${message.author.id}' AND guild_id = '${message.guild.id}'`) as Member

        if (!member) {
            await message.channel.send("Du bist nicht registriert.")
            return
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
}
