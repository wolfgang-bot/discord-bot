import Configuration from "@personal-discord-bot/shared/dist/module/Configuration"
import Context from "@personal-discord-bot/shared/dist/module/Context"

abstract class Manager {
    context: Context
    config: Configuration

    constructor(context: Context) {
        this.context = context
    }

    abstract init(): Promise<void>

    abstract delete(): Promise<void>
}

export default Manager
