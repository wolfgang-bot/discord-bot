import BaseEmbed from "../../../lib/BaseEmbed"
import LocaleServiceProvider from "../../../services/LocaleServiceProvider"
import { CommandGroupMap } from "../../../services/CommandRegistry"
import { makeCodeblock } from "../../../utils"

export default class HelpEmbed extends BaseEmbed {
    constructor(config, locale: LocaleServiceProvider, groups: CommandGroupMap) {
        super(config)

        this.setTitle(locale.translate("embed_help_title"))
            .setDescription(locale.translate("embed_help_desc", process.env.DISCORD_BOT_PREFIX))

        Object.entries(groups).forEach(([group, commands]) => {
            const commandNames = commands.map(command => command.name).join("\n")
            this.addField(group, makeCodeblock(commandNames), true)
        })
    }
}