import { APIUser, APIGuild, RESTPostOAuth2AccessTokenResult } from "discord-api-types/v8"
import fetch from "node-fetch"
import jwt from "jsonwebtoken"
import config from "../config"
import { makeURL } from "@personal-discord-bot/shared/dist/utils"

export type ExtendedAPIGuild = APIGuild & {
    isActive?: boolean
}

export default class OAuthServiceProvider {
    /**
     * Request an oauth token from discord
     */
    static requestToken(code: string): Promise<RESTPostOAuth2AccessTokenResult> {
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
     * Make an api request with an oauth token
     */
    static apiRequest(token: string, path: string): Promise<any> {
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
     */
    static fetchProfile(token: string): Promise<APIUser> {
        return OAuthServiceProvider.apiRequest(token, "/users/@me")
    }

    /**
     * Fetch the guilds of a discord user
     */
    static fetchGuilds(token: string): Promise<ExtendedAPIGuild[]> {
        return OAuthServiceProvider.apiRequest(token, "/users/@me/guilds")
    }

    /**
     * Generates a token (JWT)
     */
    static generateToken(input: string) {
        return jwt.sign(input, process.env.JWT_SECRET)
    }

    /**
     * Verifies and decodes a token (JWT)
     */
    static verifyToken(token: string): Promise<string> {
        return new Promise((resolve, reject) => {
            jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
                if (error) reject(error)
                else resolve(decoded as unknown as string)
            })
        })
    }
}
