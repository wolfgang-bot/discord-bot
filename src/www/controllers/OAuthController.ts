import * as Discord from "discord.js"
import { Response } from "express"
import HttpController from "../../lib/HttpController"
import OAuthServiceProvider from "../services/OAuthServiceProvider"
import User from "../../models/User"
import Guild from "../../models/Guild"
import { InternalRequest } from "../server"

export default class OAuthController extends HttpController {
    /**
     * Receive an OAuth token from discord.
     */
    static async oauthDiscord(req: InternalRequest, res: Response) {
        try {
            // Request oauth token
            const data = await OAuthServiceProvider.requestToken(req.query.code as string)
            const { access_token, refresh_token } = data

            // Get user profile
            const userData = await OAuthServiceProvider.fetchProfile(access_token)

            // Store token in database
            let user = await User.findBy("id", userData.id) as User
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
    static getProfile(req: InternalRequest, res: Response) {
        res.send(req.user)
    }

    /**
     * Get all guilds which are registered by the bot and manageable by the user
     */
    static async getGuilds(req: InternalRequest, res: Response) {
        const guilds = await OAuthServiceProvider.fetchGuilds(req.user.access_token)
        
        // Filter manageable guilds
        const filtered = guilds.filter(guild => {
            return new Discord.Permissions(guild.permissions as string as Discord.PermissionResolvable).has("MANAGE_GUILD")
        })
        
        // Filter existing guilds
        const activeGuilds = {}
        await Promise.all(filtered.map(async guild => {
            const model = await Guild.findBy("id", guild.id)
            activeGuilds[guild.id] = !!model
        }))

        filtered.sort((a, b) => activeGuilds[b.id] - activeGuilds[a.id])
        
        res.send(filtered)
    }

    /**
     * Get guild by id
     */
    static async getGuild(req: InternalRequest, res: Response) {
        try {
            const guild = await OAuthController.client.guilds.fetch(req.params.id)
    
            if (!guild) {
                return res.status(404).end()
            }
    
            res.send({
                id: guild.id,
                name: guild.name,
                icon: guild.icon
            })
        } catch(error) {
            if (process.env.NODE_ENV === "development") {
                console.error(error)
            }

            return res.status(404).end()
        }
    }
}