const Discord = require("discord.js")
const OAuthServiceProvider = require("../services/OAuthServiceProvider.js")
const User = require("../../models/User.js")
const Guild = require("../../models/Guild.js")

class OAuthController {
    /**
     * Discord bot client instance
     */
    static client = null

    static setDiscordClient(client) {
        OAuthController.client = client
    }

    /**
     * Receive an OAuth token from discord.
     */
    static async oauthDiscord(req, res) {
        try {
            // Request oauth token
            const data = await OAuthServiceProvider.requestToken(req.query.code)
            const { access_token, refresh_token } = data

            // Get user profile
            const userData = await OAuthServiceProvider.fetchProfile(access_token)

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
     * Get all guilds which are registered by the bot and manageable by the user
     */
    static async getGuilds(req, res) {
        const guilds = await OAuthServiceProvider.fetchGuilds(req.user.access_token)

        // Filter manageable guilds
        const filtered = guilds.filter(guild => {
            return new Discord.Permissions(guild.permissions).has("MANAGE_GUILD")
        })

        // Filter existing guilds
        await Promise.all(filtered.map(async guild => {
            const model = await Guild.findBy("id", guild.id)

            guild.active = !!model
        }))

        filtered.sort((a, b) => b.active - a.active)
        
        res.send(filtered)
    }

    /**
     * Get guild by id
     */
    static async getGuild(req, res) {
        const guild = await OAuthController.client.guilds.fetch(req.params.id)

        if (!guild) {
            return res.status(404).end()
        }

        res.send({
            id: guild.id,
            name: guild.name,
            icon: guild.icon
        })
    }
}

module.exports = OAuthController