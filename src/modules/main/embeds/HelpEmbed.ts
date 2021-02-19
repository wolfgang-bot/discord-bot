import BaseEmbed from "../../../lib/BaseEmbed"
import LocaleProvider from "../../../services/LocaleProvider"
import { CommandGroupMap } from "../../../lib/CommandGroup"
import { makeCodeblock } from "../../../utils"

export default class HelpEmbed extends BaseEmbed {
    constructor(config, locale: LocaleProvider, groups: CommandGroupMap) {
        super(config)

        this.setTitle(locale.translate("embed_help_title"))
            .setDescription(locale.translate("embed_help_desc", process.env.DISCORD_BOT_PREFIX))

        Object.entries(groups).forEach(([group, commands]) => {
            const commandNames = commands.map(command => command.name).join("\n")
            this.addField(group, makeCodeblock(commandNames), true)
        })
    }
}