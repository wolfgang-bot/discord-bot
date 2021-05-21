import Command from "../../lib/Command"
import SchedulesManager from "./managers/SchedulesManager"

export default abstract class CustomCommand extends Command {
    scheduler: SchedulesManager
}
