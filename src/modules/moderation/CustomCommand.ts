import Command from "../../lib/Command"
import MuteManager from "./managers/MuteManager"
import ScheduleManager from "./managers/ScheduleManager"

export default abstract class CustomCommand extends Command {
    scheduler: ScheduleManager
    muter: MuteManager
}
