const HttpOAuthController = require("../../controllers/OAuthController.js")

class GuildController {
    /**
     * @param {Dicord.Client} client 
     */
    constructor(client) {
        this.client = client
    }

    /**
     * Forward request to the OAuthController.getGuilds method
     * 
     * @param {Socket} socket
     * @param {Function} send
     */
    async getGuilds(socket, send) {
        HttpOAuthController.getGuilds(socket, { send })
    }
}

module.exports = GuildController