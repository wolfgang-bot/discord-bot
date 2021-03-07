import Discord from "discord.js"
import sharp from "sharp"
import fetch from "node-fetch"
import Command from "../../../lib/Command"
import ProfileCard from "../profile-card"
import Member from "../../../models/Member"
import ModuleInstance from "../../../models/ModuleInstance"
import ReputationSystemConfig from "../models/Configuration"
import LocaleProvider from "../../../services/LocaleProvider"

export default class ProfileCommand extends Command {
    name = "profile"
    group = "General"
    description = "command_profile_desc"
    alias = ["me", "rank"]

    async run(message: Discord.Message) {
        const member = await Member.where(`user_id = '${message.author.id}' AND guild_id = '${message.guild.id}'`) as Member
        const locale = (await LocaleProvider.guild(message.guild)).scope("reputation-system")

        if (!member) {
            await message.channel.send(locale.translate("error_not_registered"))
            return
        }

        await member.fetchDiscordUser(message.client)

        const config = await ModuleInstance.config(message.guild, "reputation-system") as ReputationSystemConfig
        
        // Fetch avatar image
        const res = await fetch(member.discordUser.displayAvatarURL({ format: "png" }))
        const base64 = (await res.buffer()).toString("base64")
        
        const svg = new ProfileCard(config, member, base64).toString()
        const buffer = Buffer.from(svg, "utf-8")

        const image = await sharp(buffer).png().toBuffer()

        await message.channel.send("", { files: [image] })
    }
}
