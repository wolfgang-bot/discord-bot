import { Response } from "express"
import OAuthServiceProvider from "../services/OAuthServiceProvider"
import User from "../../models/User"
import { AuthorizedRequest } from "../server"

export default class OAuthController {
    /**
     * Receive an OAuth token from discord.
     */
    static async oauthDiscord(req: AuthorizedRequest, res: Response) {
        try {
            // Request oauth token
            const data = await OAuthServiceProvider.requestToken(req.query.code as string)
            const { access_token, refresh_token } = data

            // Get user profile
            const userData = await OAuthServiceProvider.fetchProfile(access_token)

            let user = await User.findBy("id", userData.id) as User
            
            if (!user) {
                user = new User({
                    id: userData.id
                })
                await user.store()
            }

            user.discordUser = userData
            user.access_token = access_token
            user.refresh_token = refresh_token
            await user.update()

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
    static getProfile(req: AuthorizedRequest, res: Response) {
        res.send(req.user)
    }
}
