import Discord from "discord.js"
import Guild from "@personal-discord-bot/shared/dist/models/Guild"
import Command from "../../../../lib/Command"
import LocaleProvider from "@personal-discord-bot/shared/dist/LocaleProvider"
import ModulesEmbed from "../../embeds/ModulesEmbed"

export default class ListCommand extends Command {
    name = "list"
    description = "command_modules_list_desc"

    async run(message: Discord.Message) {
        const locale = await LocaleProvider.guild(message.guild)

        const config = await Guild.config(message.guild)
        const guild = await Guild.findBy("id", message.guild.id) as Guild

        await message.channel.send(new ModulesEmbed(config, locale, { guild }))
    }
}
