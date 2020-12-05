const OAuthServiceProvider = require("../Services/OAuthServiceProvider.js")
const User = require("../../models/User.js")

class ProtectMiddleware {
    /**
     * Get a user from request headers
     */
    static async getUser(req) {
        if (!req.header("Authorization")) {
            return
        }
    
        const token = req.header("Authorization").split(" ")[1]
    
        const userId = await OAuthServiceProvider.verifyToken(token)
        const user = await User.findBy("id", userId)

        const discordUser = await OAuthServiceProvider.getProfile(user.access_token)
        Object.assign(user, discordUser)
    
        return user
    }

    /**
     * Inject a user object into the request
     */
    static async required(req, res, next) {
        if (!req.header("Authorization")) {
            return res.sendStatus(401)
        }

        try {
            const user = await ProtectMiddleware.getUser(req)

            if (!user) {
                throw new Error("Could not fetch user")
            }

            req.user = user
        } catch(error) {
            if (process.env.NODE_ENV === "development") {
                console.error(error)
            }

            return res.status(401).send({ error: "Invalid token" })
        }

        next()
    }

    /**
     * Inject user into request or continue without user
     */
    static async notRequired(req, res, next) {
        try {
            const user = await ProtectMiddleware.getUser(req)

            if (user) {
                req.user = user
            }
        } catch { } finally {
            next()
        }
    }
}

module.exports = ProtectMiddleware 