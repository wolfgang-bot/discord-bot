import Configuration from "../lib/Configuration"
import Context from "./Context"
import Guild from "../models/Guild"

abstract class Manager {
    context: Context
    config: Configuration

    constructor(context: Context) {
        this.context = context
    }

    async init() {
        this.config = await Guild.config(this.context.guild)["{MODULE_NAME}"]
    }

    async delete() {}
}

export default Manager