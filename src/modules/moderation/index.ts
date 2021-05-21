import Configuration from "../../lib/Configuration"
import Context from "../../lib/Context"
import { command, module } from "../../lib/decorators"
import Module from "../../lib/Module"
import ScheduleManager from "./managers/ScheduleManager"
import CustomCommand from "./CustomCommand"
import BanCommand from "./commands/ban"
import KickCommand from "./commands/kick"
import TempbanCommand from "./commands/tempban"
import UnbanCommand from "./commands/unban"
import MuteManager from "./managers/MuteManager"
import MuteCommand from "./commands/mute"
import UnmuteCommand from "./commands/unmute"

@module({
    key: "moderation",
    name: "Moderation",
    desc: "Adds moderation commands",
    features: [
        "Adds moderation commands"
    ]
})
@command(BanCommand)
@command(TempbanCommand)
@command(UnbanCommand)
@command(KickCommand)
@command(MuteCommand)
@command(UnmuteCommand)
export default class ToolboxModule extends Module {
    static config = Configuration
    
    scheduleManager: ScheduleManager
    muteManager: MuteManager

    commands: CustomCommand[]

    constructor(context: Context, config: Configuration) {
        super(context, config)
        this.commands = ToolboxModule.createCommands() as CustomCommand[]
    }

    async start() {
        this.scheduleManager = new ScheduleManager(this.context, this.config)
        this.muteManager = new MuteManager(this.context, this.config)
        
        await Promise.all([
            this.scheduleManager.init(),
            this.muteManager.init()
        ])

        this.registerCommands()
        this.commands.forEach(command => {
            command.scheduler = this.scheduleManager
            command.muter = this.muteManager
        })
    }

    async stop() {
        this.unregisterCommands()
        await Promise.all([
            this.scheduleManager.delete(),
            this.muteManager.delete()
        ])
    }
}
