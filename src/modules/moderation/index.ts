import Context from "../../lib/Context"
import { argument, command, module } from "../../lib/decorators"
import Module from "../../lib/Module"
import { TYPES as ARGUMENT_TYPES } from "../../lib/Argument"
import ScheduleManager from "./managers/ScheduleManager"
import CustomCommand from "./CustomCommand"
import Configuration from "./models/Configuration"
import BanCommand from "./commands/ban"
import KickCommand from "./commands/kick"
import TempbanCommand from "./commands/tempban"
import UnbanCommand from "./commands/unban"
import MuteManager from "./managers/MuteManager"
import MuteCommand from "./commands/mute"
import UnmuteCommand from "./commands/unmute"
import TempmuteCommand from "./commands/tempmute"
import SweepCommand from "./commands/sweep"

@module({
    key: "moderation",
    name: "Moderation",
    desc: "Adds moderation commands",
    position: 5,
    features: [
        "Adds moderation commands"
    ]
})
@argument({
    type: ARGUMENT_TYPES.STRING,
    key: "mutedRoleName",
    name: "Muted Role Name",
    desc: "Name of the role for muted users",
    defaultValue: "🔇 Muted"
})
@command(BanCommand)
@command(TempbanCommand)
@command(UnbanCommand)
@command(KickCommand)
@command(MuteCommand)
@command(TempmuteCommand)
@command(UnmuteCommand)
@command(SweepCommand)
export default class ToolboxModule extends Module {
    static config = Configuration
    
    config: Configuration
    commands: CustomCommand[]
    scheduleManager: ScheduleManager
    muteManager: MuteManager

    constructor(context: Context, config: Configuration) {
        super(context, config)
        this.commands = ToolboxModule.createCommands() as CustomCommand[]
    }

    async start() {
        this.muteManager = new MuteManager(this.context, this.config)
        this.scheduleManager = new ScheduleManager(
            this.context,
            this.config,
            this.muteManager
        )
        
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
