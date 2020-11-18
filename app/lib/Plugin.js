/**
 * The interface for the main class of a plugin
 * 
 * @interface
 */
class Plugin {
    /**
     * Creates a new instance of the class from a configuration object.
     * 
     * @param {Discord.Client} client 
     * @param {Object} config 
     * 
     * @returns {Plugin}
     */
    static async fromConfig(client, config) {}

    /**
     * Creates a new instance of the class from a discord message.
     *
     * @param {Discord.Message} message
     * @param {String[]} args
     *
     * @returns {Plugin}
     */
    static async fromMessage(message, args) {}

    /**
     * Initializes the plugin.
     * Code which needs to be run whenever the plugin is loaded should go here.
     */
    async init() {}

    /**
     * Get the configuration object of the plugin from which the plugin can be
     * restored via the Plugin.fromConfig method.
     * 
     * @returns {Object} 
     */
    getConfig() {}
}

module.exports = Plugin