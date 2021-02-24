import Discord from "discord.js"
import { Server, Socket } from "socket.io"
import OAuthServiceProvider from "../services/OAuthServiceProvider"
import { User, Guild } from "@personal-discord-bot/shared/dist/models"
import ConnectionManager from "./ConnectionManager"
import { ExtendedAPIGuild } from "../services/OAuthServiceProvider"

export type AuthorizedSocket = Socket & {
    handshake: {
        auth?: {
            token?: string
        }
    }
    user: User
    guilds: Record<string, ExtendedAPIGuild>
}

const cache = {
    user: {
        id: '778665386497015838',
        username: 'Tracer - Secondary',
        avatar: null,
        discriminator: '1967',
        public_flags: 0,
        flags: 0,
        locale: 'de',
        mfa_enabled: false
    },
    guilds: {
        '786167187030540309': {
            id: '786167187030540309',
            name: 'Server von Tracer - Secondary',
            icon: null,
            owner: true,
            permissions: 2147483647,
            features: [],
            permissions_new: '4294967295',
            isActive: true
        },
        '807232524207128588': {
            id: '807232524207128588',
            name: 'Mein Neuer Server',
            icon: null,
            owner: true,
            permissions: 2147483647,
            features: [],
            permissions_new: '4294967295',
            isActive: false
        }
    }
}

export default class SocketManager {
    server: Server
    client: Discord.Client
    connections: Record<string, ConnectionManager> = {}
    
    constructor(socket: Server, client: Discord.Client) {
        this.server = socket
        this.client = client
    }

    init() {
        this.server.use(this.authorize.bind(this))

        this.server.on("connection", (socket: AuthorizedSocket) => {
            if (process.env.NODE_ENV === "development") {
                console.log("Connection", socket.id)
            }

            const connection = new ConnectionManager(socket, this.client)
            this.connections[socket.id] = connection

            socket.on("disconnect", () => {
                connection.destroy()
                delete this.connections[socket.id]
            })
        })
    }
    
    async authorize(socket: AuthorizedSocket, next: Function) {
        if (!socket.handshake.auth?.token) {
            return next(new Error("Unauthorized"))
        }

        const { token } = socket.handshake.auth

        const userId = await OAuthServiceProvider.verifyToken(token)
        const user = await User.findBy("id", userId) as User

        if (!user) {
            return next(new Error("Unauthorized"))
        }

        try {
            // const [discordUser, guilds] = await Promise.all([
            //     OAuthServiceProvider.fetchProfile(user.access_token),
            //     this.fetchGuilds(user)
            // ])

            // user.discordUser = discordUser
            // socket.user = user
            // socket.guilds = guilds
            type PromiseResolvedType<T> = T extends Promise<infer R> ? R : never;
            user.discordUser = cache.user as PromiseResolvedType<typeof OAuthServiceProvider.fetchProfile>
            socket.user = user
            const { fetchGuilds } = this
            socket.guilds = cache.guilds as PromiseResolvedType<typeof fetchGuilds>
        } catch (error) {
            if (process.env.NODE_ENV === "development") {
                console.error(error)
            }

            return next(new Error("Invalid token"))
        }

        next()
    }

    async fetchGuilds(user: User) {
        const guilds = await OAuthServiceProvider.fetchGuilds(user.access_token)

        // Filter guilds where the user is an admin
        const filtered = guilds.filter(guild => {
            return new Discord.Permissions(guild.permissions as string as Discord.PermissionResolvable)
                .has("MANAGE_GUILD")
        })

        // Mark guilds which are registered by the bot
        await Promise.all(filtered.map(async guild => {
            const model = await Guild.findBy("id", guild.id)
            guild.isActive = !!model
        }))

        const guildsMap: Record<string, ExtendedAPIGuild> = {}

        filtered.forEach(guild => {
            guildsMap[guild.id] = guild
        })

        return guildsMap
    }
}
