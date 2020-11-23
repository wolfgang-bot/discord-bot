/**
 * The interface for the main class of a module
 * 
 * @interface
 */
class Module {
    /**
     * Meta data (required for the "help" command)
     */
    static meta = {
        name: "", // THem name of the module
        description: "", // Short description about what the module does
        arguments: "", // Required and / or optional arguments to start the module
        features: [] // All the features of the module
    }

    /**
     * Creates a new instance of the class from a configuration object.
     * 
     * @param {Discord.Client} client
     * @param {Discord.Guid} guild
     * @param {Object} config
     * 
     * @returns {Module}
     */
    static async fromConfig(client, guild, config) {}

    /**
     * Creates a new instance of the class from a discord message.
     *
     * @param {Discord.Client} client
     * @param {Discord.Guild} guild
     * @param {Discord.Message} message
     * @param {String[]} args
     *
     * @returns {Module}
     */
    static async fromMessage(client, guild, message, args) {}

    /**
     * Starts the module.
     * Code which needs to be run whenever the module is loaded should go here.
     */
    async start() {}

    /**
     * Stops the module.
     * Code which reverts the actions done in module.start should go here.
     */
    async stop() {}

    /**
     * Get the configuration object of the module from which the module can be
     * restored via the Module.fromConfig method.
     * 
     * @returns {Object} 
     */
    getConfig() {}
}

module.exports = Module