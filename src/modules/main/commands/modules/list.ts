import Discord from "discord.js"
import Command from "../../../../lib/Command"
import LocaleServiceProvider from "../../../../services/LocaleServiceProvider"
import ModulesEmbed from "../../embeds/ModulesEmbed"
import Guild from "../../../../models/Guild"

export default class ListCommand extends Command {
    name = "list"
    description = "command_modules_list_desc"

    async run(message: Discord.Message) {
        const locale = await LocaleServiceProvider.guild(message.guild)

        const config = await Guild.config(message.guild)
        const guild = await Guild.findBy("id", message.guild.id) as Guild

        await message.channel.send(new ModulesEmbed(config, locale, { guild }))
    }
}