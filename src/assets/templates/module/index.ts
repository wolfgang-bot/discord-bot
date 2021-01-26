import Configuration from "./models/Configuration"

export default class Module {
    static makeConfigFromArgs = Configuration.fromArgs
    static makeConfigFromJSON = Configuration.fromJSON
    
    /**
     * Starts the module.
     * Code which needs to be run whenever the module is loaded should go here.
     */
    async start() { }

    /**
     * Stops the module.
     * Code which reverts the actions done in module.start should go here.
     */
    async stop() { }

    /**
     * Get the configuration object of the module from which it can be restored.
     */
    getConfig() { }
}