const Configuration = require("./models/Configuration.js")

class Module {
    static makeConfigFromArgs = Configuration.fromArgs
    static makeConfigFromJSON = Configuration.fromJSON

    /**
     * @param {Context} context 
     * @param {Configuration} config 
     */
    constructor(context, config) { }

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
     * Get the configuration object of the module from which the module can be restored.
     * 
     * @returns {Configuration} 
     */
    getConfig() { }
}

module.exports = Module