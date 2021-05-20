import Module from "../../lib/Module"
import Configuration from "../../lib/Configuration"
import Context from "../../lib/Context"
import { command, module } from "../../lib/decorators"
import GuideCommandGroup from "./commands"

@module({
    key: "discord-guide",
    name: "Discord Guide",
    desc: "Adds commands which explain how discord works",
    features: [
        "Adds commands which explain how discord works"
    ]
})
@command(GuideCommandGroup)
export default class DiscordGuideModule extends Module {
    static config = Configuration

    constructor(context: Context, config: Configuration) {
        super(context, config)
        this.commands = DiscordGuideModule.createCommands()
    }

    async start() {
        this.registerCommands()
    }

    async stop() {
        this.unregisterCommands()
    }
}
