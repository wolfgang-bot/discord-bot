class Module {
    /**
     * Creates a new instance of the class from a configuration object.
     * 
     * @param {Discord.Client} client
     * @param {Discord.Guid} guild
     * @param {Object} config
     * 
     * @returns {Module}
     */
    static async fromConfig(client, guild, config) { }

    /**
     * Creates a new instance of the class from an arguments array.
     *
     * @param {Discord.Client} client
     * @param {Discord.Guild} guild
     * @param {Array<String>} args
     *
     * @returns {Module}
     */
    static async fromArguments(client, guild, args) { }

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
     * Get the configuration object of the module from which the module can be
     * restored via the Module.fromConfig method.
     * 
     * @returns {Object} 
     */
    getConfig() { }
}

module.exports = Module