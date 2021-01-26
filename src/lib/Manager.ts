import Configuration from "../lib/Configuration"
import Context from "./Context"

abstract class Manager {
    context: Context
    config: Configuration

    constructor(context: Context) {
        this.context = context
    }

    async init() {}

    async delete() {}
}

export default Manager