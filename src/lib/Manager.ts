import Configuration from "../lib/Configuration"
import Context from "./Context"

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