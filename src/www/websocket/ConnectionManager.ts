import Discord from "discord.js"
import { AuthorizedSocket } from "./SocketManager"
import ModuleInstanceRegistry from "../../services/ModuleInstanceRegistry"
import Module from "../../lib/Module"
import GuildController from "./controllers/GuildController"
import ModuleController from "./controllers/ModuleController"
import ConfigController from "./controllers/ConfigController"
import LocaleController from "./controllers/LocaleController"

export default class ConnectionManager {
    socket: AuthorizedSocket
    client: Discord.Client
    guildController: GuildController
    moduleController: ModuleController
    configController: ConfigController
    localeController: LocaleController

    constructor(socket: AuthorizedSocket, client: Discord.Client) {
        this.socket = socket
        this.client = client

        this.guildController = new GuildController(client, socket)
        this.moduleController = new ModuleController(client, socket)
        this.configController = new ConfigController(client, socket)
        this.localeController = new LocaleController(client, socket)

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
        this.socket.on("get:guild/locale",              this.guildController.getLocale.bind(this.guildController))
        this.socket.on("post:guild/locale",             this.guildController.setLocale.bind(this.guildController))

        this.socket.on("get:config-descriptive",        this.configController.getConfigDescriptive.bind(this.configController))
        this.socket.on("post:config",                   this.configController.updateConfig.bind(this.configController))

        this.socket.on("get:modules",                   this.moduleController.getModules.bind(this.moduleController))
        this.socket.on("get:module-instances",          this.moduleController.getInstances.bind(this.moduleController))
        this.socket.on("post:module-instances/start",   this.moduleController.startInstance.bind(this.moduleController))
        this.socket.on("post:module-instances/stop",    this.moduleController.stopInstance.bind(this.moduleController))
        this.socket.on("post:module-instances/restart", this.moduleController.restartInstance.bind(this.moduleController))

        this.socket.on("get:locales",                   this.localeController.getLocales.bind(this.localeController))
    }

    attachEventEmitters() {
        this.socket.pushModuleInstances = this.moduleController.pushModuleInstances.bind(this.moduleController)
    }

    attachModuleInstanceListeners() {
        ModuleInstanceRegistry.eventEmitter.on("update", this.handleModuleInstanceUpdate)
    }

    removeModuleInstanceListeners() {
        ModuleInstanceRegistry.eventEmitter.removeListener("update", this.handleModuleInstanceUpdate)
    }

    handleModuleInstanceUpdate(instance: Module) {
        if (instance.context.guild.id in this.socket.guilds) {
            this.socket.pushModuleInstances([instance])
        }
    }
}