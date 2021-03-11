import { Response } from "express"
import log from "loglevel"
import OAuthServiceProvider from "../services/OAuthServiceProvider"
import User from "../../models/User"
import { AuthorizedRequest } from "../server"

export default class ProtectMiddleware {
    /**
     * Get a user from request headers
     */
    static async getUser(req: AuthorizedRequest) {
        if (!req.header("Authorization")) {
            return
        }
    
        const token = req.header("Authorization").split(" ")[1]
    
        const userId = await OAuthServiceProvider.verifyToken(token)
        const user = await User.findBy("id", userId) as User
        
        user.discordUser = await OAuthServiceProvider.fetchProfile(user.access_token)
    
        return user
    }

    /**
     * Inject a user object into the request
     */
    static async required(req: AuthorizedRequest, res: Response, next: Function) {
        if (!req.header("Authorization")) {
            return res.sendStatus(401)
        }

        try {
            const user = await ProtectMiddleware.getUser(req)

            if (!user) {
                throw new Error("Could not fetch user")
            }

            req.user = user
        } catch (error) {
            log.debug(error)
            return res.status(401).send({ error: "Invalid token" })
        }

        next()
    }

    /**
     * Inject user into request or continue without user
     */
    static async notRequired(req: AuthorizedRequest, res: Response, next: Function) {
        try {
            const user = await ProtectMiddleware.getUser(req)

            if (user) {
                req.user = user
            }
        } finally {
            next()
        }
    }
}
