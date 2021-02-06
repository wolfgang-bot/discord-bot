import Discord from "discord.js"
import { InternalSocket } from "./SocketManager"
import GuildController from "./controllers/GuildController"
import ModulesController from "./controllers/ModulesController"
import ConfigController from "./controllers/ConfigController"
import ModuleServiceProvider from "../../services/ModuleServiceProvider"
import Module from "../../lib/Module"

export default class ConnectionManager {
    socket: InternalSocket
    client: Discord.Client
    guildController: GuildController
    modulesController: ModulesController
    configController: ConfigController

    constructor(socket: InternalSocket, client: Discord.Client) {
        this.socket = socket
        this.client = client

        this.guildController = new GuildController(client, socket)
        this.modulesController = new ModulesController(client, socket)
        this.configController = new ConfigController(client, socket)

        this.handleModuleInstanceUpdate = this.handleModuleInstanceUpdate.bind(this)

        this.attachEventReceivers()
        this.attachEventEmitters()
        this.attachModuleInstanceListeners()
    }

    clean() {
        this.removeModuleInstanceListeners()
    }

    attachEventReceivers() {
        this.socket.on("get:guilds",                    this.guildController.getGuilds.bind(this.guildController))
        this.socket.on("get:guild/channels",            this.guildController.getChannels.bind(this.guildController))

        this.socket.on("get:config-descriptive",        this.configController.getConfigDescriptive.bind(this.configController))
        this.socket.on("post:config",                   this.configController.updateConfig.bind(this.configController))

        this.socket.on("get:modules",                   this.modulesController.getModules.bind(this.modulesController))
        this.socket.on("get:module-instances",          this.modulesController.getInstances.bind(this.modulesController))
        this.socket.on("post:module-instances/start",   this.modulesController.startInstance.bind(this.modulesController))
        this.socket.on("post:module-instances/stop",    this.modulesController.stopInstance.bind(this.modulesController))
        this.socket.on("post:module-instances/restart", this.modulesController.restartInstance.bind(this.modulesController))
    }

    attachEventEmitters() {
        this.socket.pushModuleInstances = this.modulesController.pushModuleInstances.bind(this.modulesController)
    }

    attachModuleInstanceListeners() {
        ModuleServiceProvider.eventEmitter.on("update", this.handleModuleInstanceUpdate)
    }

    removeModuleInstanceListeners() {
        ModuleServiceProvider.eventEmitter.removeListener("update", this.handleModuleInstanceUpdate)
    }

    handleModuleInstanceUpdate(instance: Module) {
        if (instance.context.guild.id in this.socket.guilds) {
            this.socket.pushModuleInstances([instance])
        }
    }
}