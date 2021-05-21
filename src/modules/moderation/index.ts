import Configuration from "../../lib/Configuration"
import Context from "../../lib/Context"
import { command, module } from "../../lib/decorators"
import Module from "../../lib/Module"
import BanCommand from "./commands/ban"
import TempbanCommand from "./commands/tempban"
import UnbanCommand from "./commands/unban"
import CustomCommand from "./CustomCommand"
import SchedulesManager from "./managers/SchedulesManager"

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
