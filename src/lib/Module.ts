import { EventEmitter } from "events"
import Configuration from "./Configuration"

enum STATES {
    ACTIVE = "active",
    INACTIVE = "inactive",
    STARTING = "starting",
    STOPPING = "stopping"
}

abstract class Module extends EventEmitter {
    static STATES = STATES
    static makeConfigFromArgs: Function
    static makeConfigFromJSON: Function

    context: any
    config: Configuration
    state: STATES

    /**
     * Assign generator methods to module class
     */
    static bindConfig(module: typeof Module, config: typeof Configuration) {
        module.makeConfigFromArgs = config.fromArgs
        module.makeConfigFromJSON = config.fromJSON
    }

    constructor(context: any, config: Configuration) {
        super()

        this.context = context
        this.config = config
        this.state = Module.STATES["INACTIVE"]
    }

    /**
     * Start the module
     */
    async _start() {
        this.setState(Module.STATES["STARTING"])
        await this.start()
        this.setState(Module.STATES["ACTIVE"])
    }

    async start() {}

    /**
     * Stop the module
     */
    async _stop() {
        this.setState(Module.STATES["STOPPING"])
        await this.stop()
        this.setState(Module.STATES["INACTIVE"])
    }

    async stop() {}

    /**
     * Set the module's state
     */
    setState(newState: STATES) {
        this.state = newState
        this.emit("update")
    }

    getConfig() {
        return this.config
    }

    toJSON(): object {
        return {
            moduleName: this.context.module.name,
            state: this.state
        }
    }
}

export default Module