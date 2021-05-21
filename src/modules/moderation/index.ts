import Configuration from "../../lib/Configuration"
import Context from "../../lib/Context"
import { command, module } from "../../lib/decorators"
import Module from "../../lib/Module"
import BanCommand from "./commands/ban"
import UnbanCommand from "./commands/unban"

@module({
    key: "moderation",
    name: "Moderation",
    desc: "Adds moderation commands",
    features: [
        "Addds moderation commands"
    ]
})
@command(BanCommand)
@command(UnbanCommand)
export default class ToolboxModule extends Module {
    static config = Configuration

    constructor(context: Context, config: Configuration) {
        super(context, config)
        this.commands = ToolboxModule.createCommands()
    }

    async start() {
        this.registerCommands()
    }

    async stop() {
        this.unregisterCommands()
    }
}
