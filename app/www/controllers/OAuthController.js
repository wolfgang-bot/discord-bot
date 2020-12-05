const OAuthServiceProvider = require("../services/OAuthServiceProvider.js")
const User = require("../../models/User.js")

class OAuthController {
    /**
     * Receive an OAuth token from discord.
     */
    static async oauthDiscord(req, res) {
        try {
            // Request oauth token
            const data = await OAuthServiceProvider.requestToken(req.query.code)
            const { access_token, refresh_token } = data

            // Get user profile
            const userData = await OAuthServiceProvider.getProfile(access_token)

            // Store token in database
            let user = await User.findBy("id", userData.id)
            Object.assign(user, userData)
            user.access_token = access_token
            user.refresh_token = refresh_token
            await user.update()

            // Generate jwt
            const token = OAuthServiceProvider.generateToken(user.id)

            res.render("oauth-receiver", { error: false, data: { token, user } })
        } catch (error) {
            console.error(error)

            res.render("oauth-receiver", { error: true })
        }
    }

    /**
     * Get the user profile.
     */
    static getProfile(req, res) {
        res.send(req.user)
    }

    /**
     * Get the user's guilds
     */
    static async getGuilds(req, res) {
        const guilds = await OAuthServiceProvider.getGuilds(req.user.access_token)
        res.send(guilds)
    }
}

module.exports = OAuthController