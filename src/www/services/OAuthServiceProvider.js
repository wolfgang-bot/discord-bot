const fetch = require("node-fetch")
const config = require("../config")
const jwt = require("jsonwebtoken")
const { makeURL } = require("../../utils")

class OAuthServiceProvider {
    /**
     * Request an OAuth token from discord
     * 
     * @param {String} code 
     * @returns {Promise<Object>}
     */
    static requestToken(code) {
        return new Promise((resolve, reject) => {
            const headers = {
                "Content-Type": "application/x-www-form-urlencoded"
            }

            const body = {
                client_id: process.env.DISCORD_API_CLIENT_ID,
                client_secret: process.env.DISCORD_API_CLIENT_SECRET,
                grant_type: "authorization_code",
                code,
                redirect_uri: makeURL("/api/oauth/discord"),
                scope: "identify"
            }

            fetch(config.discord.api.basename + "/oauth2/token", {
                method: "POST",
                headers,
                body: new URLSearchParams(body)
            })
                .then(res => res.json())
                .then(resolve)
                .catch(reject)
        })
    }

    /**
     * Make an api request with the oauth token
     * 
     * @param {String} token
     * @param {String} path
     * @returns {Promise<Object>}
     */
    static apiRequest(token, path) {
        return new Promise((resolve, reject) => {
            fetch(config.discord.api.basename + path, {
                headers: {
                    "Authorization": "Bearer " + token
                }
            })
                .then(res => {
                    if (res.status !== 200) {
                        console.log(res)
                        return reject(res)
                    }

                    return res.json()
                })
                .then(resolve)
        })
    }

    /**
     * Fetch the profile of a discord user
     * 
     * @param {String} token OAuth token 
     * @returns {Promise<Object>} Discord User
     */
    static fetchProfile(token) {
        return OAuthServiceProvider.apiRequest(token, "/users/@me")
    }

    /**
     * Fetch the guilds of a discord user
     * 
     * @param {String} token
     * @returns {Promise<Object>} User's Guilds
     */
    static fetchGuilds(token) {
        return OAuthServiceProvider.apiRequest(token, "/users/@me/guilds")
    }

    /**
     * Generates a token (JWT)
     * 
     * @param {String} input
     * @returns {String} Token 
     */
    static generateToken(input) {
        return jwt.sign(input, process.env.JWT_SECRET)
    }

    /**
     * Verifies and decodes a token (JWT)
     * 
     * @param {String} token
     * @returns {Promise<String>} A promise which resolves with the decoded value 
     */
    static verifyToken(token) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
                if (error) reject(error)
                else resolve(decoded)
            })
        })
    }
}

module.exports = OAuthServiceProvider