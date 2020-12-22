const OAuthServiceProvider = require("../services/OAuthServiceProvider.js")
const User = require("../../models/User.js")
const GuildController = require("./controllers/GuildController.js")
const ModulesController = require("./controllers/ModulesController.js")
const ConfigController = require("./controllers/ConfigController.js")

/**
 * Manages a websocket (socket.io) connection
 */
class SocketManager {
    /**
     * @param {Server} socket The socket.io server to attach to
     * @param {Discord.Client} client The discord bot client instance
     */
    constructor(socket, client) {
        this.socket = socket
        this.client = client

        this.guildController = new GuildController(client)
        this.modulesController = new ModulesController(client)
        this.configController = new ConfigController(client)
    }

    /**
     * Setup the websocket server
     */
    init() {
        // Attach middleware
        this.socket.use(this.authorize)

        // Define handler for new connections
        this.socket.on("connection", (socket) => {
            if (process.env.NODE_ENV === "development") {
                console.log("Connection", socket.id)
            }

            // Attach event controllers
            this.attachEvents(socket, [
                ["get:guilds", this.guildController, "getGuilds"],
                ["get:config-descriptive", this.configController, "getConfigDescriptive"],
                ["post:config", this.configController, "updateConfig"],
                ["get:modules", this.modulesController, "getModules"],
                ["get:module-instances", this.modulesController, "getInstances"],
                ["post:module-instances/start", this.modulesController, "startInstance"],
                ["post:module-instances/stop", this.modulesController, "stopInstance"],
                ["post:module-instances/restart", this.modulesController, "restartInstance"]
            ])

            // Attach sender controllers
            this.attachMethods(socket, [
                ["sendModuleInstances", this.modulesController, "sendModuleInstances"]
            ])
        })
    }

    /**
     * Attach events to the event target, where each event listener receives the
     * event target as the first argument.
     * 
     * @param {EventEmitter} target 
     * @param {Array<[String, Object, String]>} events 
     */
    attachEvents(target, events) {
        events.forEach(([name, controller, method]) => {
            if (!controller[method]) {
                throw new Error(`The method '${method}' does not exist on '${controller.constructor.name}'`)
            }

            target.on(name, controller[method].bind(controller, target))
        })
    }

    /**
     * Attaches new methods to the target, where each method receives the target
     * as the first argument.
     * 
     * @param {EventEmitter} target 
     * @param {Array<[String, Object, String]>} events
     */
    attachMethods(target, methods) {
        methods.forEach(([newMethod, controller, method]) => {
            if (!controller[method]) {
                throw new Error(`The method '${method}' does not exist on '${controller.constructor.name}'`)
            }

            target[newMethod] = controller[method].bind(controller, target)
        })
    }

    /**
     * Authorization middleware
     * 
     * @param {Socket} socket 
     * @param {Function} next 
     */
    async authorize(socket, next) {
        if (!socket.handshake.auth || !socket.handshake.auth.token) {
            return next(new Error("Unauthorized"))
        }

        const { token } = socket.handshake.auth

        const userId = await OAuthServiceProvider.verifyToken(token)
        const user = await User.findBy("id", userId)

        if (!user) {
            return next(new Error("Unauthorized"))
        }

        const discordUser = await OAuthServiceProvider.fetchProfile(user.access_token)
        Object.assign(user, discordUser)
        socket.user = user

        next()
    }
}

module.exports = SocketManager