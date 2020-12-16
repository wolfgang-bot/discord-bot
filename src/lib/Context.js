/**
 * Provides a module with contextual information.
 */
class Context {
    /**
     * @param {Object} data
     * @param {Discord.Client} data.client
     * @param {Discord.Guild} data.guild
     * @param {Module} module
     */
    constructor({ client, guild, module }) {
        this.client = client
        this.guild = guild
        this.module = module
    }
}

module.exports = Context