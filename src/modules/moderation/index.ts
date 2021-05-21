import Configuration from "../../lib/Configuration"
import Context from "../../lib/Context"
import { command, module } from "../../lib/decorators"
import Module from "../../lib/Module"
import SchedulesManager from "./managers/SchedulesManager"
import CustomCommand from "./CustomCommand"
import BanCommand from "./commands/ban"
import KickCommand from "./commands/kick"
import TempbanCommand from "./commands/tempban"
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
@command(TempbanCommand)
@command(UnbanCommand)
@command(KickCommand)
export default class ToolboxModule extends Module {
    static config = Configuration
    
    schedulesManager: SchedulesManager
    commands: CustomCommand[]

    constructor(context: Context, config: Configuration) {
        super(context, config)
        this.commands = ToolboxModule.createCommands() as CustomCommand[]
    }

    async start() {
        this.schedulesManager = new SchedulesManager(this.context, this.config)
        await this.schedulesManager.init()
        this.registerCommands()
        this.commands.forEach(command => {
            command.scheduler = this.schedulesManager
        })
    }

    async stop() {
        this.unregisterCommands()
        await this.schedulesManager.delete()
    }
}
