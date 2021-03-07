import Discord from "discord.js"
import { Server, Socket } from "socket.io"
import OAuthServiceProvider from "../services/OAuthServiceProvider"
import User from "../../models/User"
import Guild from "../../models/Guild"
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

        try {
            const { token } = socket.handshake.auth

            const userId = await OAuthServiceProvider.verifyToken(token)
            const user = await User.findBy("id", userId) as User

            if (!user) {
                return next(new Error("Unauthorized"))
            }

            const [discordUser, guilds] = await Promise.all([
                OAuthServiceProvider.fetchProfile(user.access_token),
                this.fetchGuilds(user)
            ])

            user.discordUser = discordUser
            socket.user = user
            socket.guilds = guilds
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
                .has("ADMINISTRATOR")
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
