import Discord from "discord.js"
import { Server, Socket } from "socket.io"
import OAuthServiceProvider from "../services/OAuthServiceProvider"
import User from "../../models/User"
import GuildController from "./controllers/GuildController"
import ModulesController from "./controllers/ModulesController"
import ConfigController from "./controllers/ConfigController"

export type InternalSocket = Socket & {
    handshake: {
        auth?: {
            token?: string
        }
    }
    user: User
    sendModuleInstances: Function
}

export default class SocketManager {
    server: Server
    client: Discord.Client
    
    constructor(socket: Server, client: Discord.Client) {
        this.server = socket
        this.client = client
    }

    init() {
        this.server.use(this.authorize)

        this.server.on("connection", (socket: InternalSocket) => {

            if (process.env.NODE_ENV === "development") {
                console.log("Connection", socket.id)
            }

            const guildController = new GuildController(this.client, socket)
            const modulesController = new ModulesController(this.client, socket)
            const configController = new ConfigController(this.client, socket)

            socket.on("get:guilds", guildController.getGuilds.bind(guildController))
            socket.on("get:guild/channels", guildController.getChannels.bind(guildController))
            socket.on("get:config-descriptive", configController.getConfigDescriptive.bind(configController))
            socket.on("post:config", configController.updateConfig.bind(configController))
            socket.on("get:modules", modulesController.getModules.bind(modulesController))
            socket.on("get:module-instances", modulesController.getInstances.bind(modulesController))
            socket.on("post:module-instances/start", modulesController.startInstance.bind(modulesController))
            socket.on("post:module-instances/stop", modulesController.stopInstance.bind(modulesController))
            socket.on("post:module-instances/restart", modulesController.restartInstance.bind(modulesController))

            socket.sendModuleInstances = modulesController.sendModuleInstances.bind(modulesController)
        })
    }
    
    async authorize(socket: InternalSocket, next: Function) {
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