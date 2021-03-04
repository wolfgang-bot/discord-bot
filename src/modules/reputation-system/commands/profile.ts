import Discord from "discord.js"
import sharp from "sharp"
import fetch from "node-fetch"
import Command from "../../../lib/Command"
import ProfileCard from "../profile-card"
import Member from "../../../models/Member"
import ModuleInstance from "../../../models/ModuleInstance"
import SettingsConfig from "../../settings/models/Configuration"

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

        const settings = await ModuleInstance.config(message.guild, "settings") as SettingsConfig

        // Fetch avatar image
        const res = await fetch(member.discordUser.displayAvatarURL({ format: "png" }))
        const base64 = (await res.buffer()).toString("base64")

        const svg = new ProfileCard(settings, member, base64).toString()
        const buffer = Buffer.from(svg, "utf-8")

        const image = await sharp(buffer).png().toBuffer()

        await message.channel.send("", { files: [image] })
    }
}
