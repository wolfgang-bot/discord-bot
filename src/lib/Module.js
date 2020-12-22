const { EventEmitter } = require("events")

class Module extends EventEmitter {
    static STATES = {
        "ACTIVE": "active",
        "INACTIVE": "inactive",
        "STARTING": "starting",
        "STOPPING": "stopping"
    }

    /**
     * Create static config generator methods for the given class
     * 
     * @param {Function<Module>} module 
     * @param {Function} config 
     */
    static bindConfig(module, config) {
        module.makeConfigFromArgs = config.fromArgs
        module.makeConfigFromJSON = config.fromJSON
    }

    constructor(context, config) {
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

    /**
     * Stop the module
     */
    async _stop() {
        this.setState(Module.STATES["STOPPING"])
        await this.stop()
        this.setState(Module.STATES["INACTIVE"])
    }

    /**
     * Set the module's state
     * 
     * @param {Module.State} newState 
     */
    setState(newState) {
        this.state = newState
        this.emit("update")
    }

    getConfig() {
        return this.config
    }

    toJSON() {
        return {
            moduleName: this.context.module.name,
            state: this.state
        }
    }
}

module.exports = Module