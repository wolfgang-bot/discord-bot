import Discord from "discord.js"
import { Server, Socket } from "socket.io"
import OAuthServiceProvider from "../services/OAuthServiceProvider"
import User from "../../models/User"
import ConnectionManager from "./ConnectionManager"

export type AuthorizedSocket = Socket & {
    handshake: {
        auth?: {
            token?: string
        }
    }
    user: User
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

            user.discordUser = await OAuthServiceProvider.fetchProfile(user.access_token)
            socket.user = user
        } catch (error) {
            if (process.env.NODE_ENV === "development") {
                console.error(error)
            }

            return next(new Error("Invalid token"))
        }

        next()
    }
}
