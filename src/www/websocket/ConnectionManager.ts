import Discord from "discord.js"
import WebSocketEmitter from "../../lib/WebSocketEmitter"
import { AuthorizedSocket } from "./SocketManager"
import GuildController from "./controllers/GuildController"
import ModuleController from "./controllers/ModuleController"
import ConfigController from "./controllers/ConfigController"
import LocaleController from "./controllers/LocaleController"
import SubscriptionController from "./controllers/SubscriptionController"
import ModuleInstanceEmitter from "./emitter/ModuleInstanceEmitter"
import SubscriptionManager from "./SubscriptionManager"

export default class ConnectionManager {
    socket: AuthorizedSocket
    client: Discord.Client

    guildController: GuildController
    moduleController: ModuleController
    configController: ConfigController
    localeController: LocaleController
    subscriptionController: SubscriptionController

    emitter: WebSocketEmitter[] = []
    subscriptionManager: SubscriptionManager

    constructor(socket: AuthorizedSocket, client: Discord.Client) {
        this.socket = socket
        this.client = client

        this.subscriptionManager = new SubscriptionManager(client, socket)

        this.guildController = new GuildController(client, socket)
        this.moduleController = new ModuleController(client, socket)
        this.configController = new ConfigController(client, socket)
        this.localeController = new LocaleController(client, socket)
        this.subscriptionController = new SubscriptionController(client, socket, {
            onSubscribe: this.subscriptionManager.subscribe.bind(this.subscriptionManager),
            onUnsubscribe: this.subscriptionManager.unsubscribe.bind(this.subscriptionManager)
        })

        this.emitter.push(new ModuleInstanceEmitter(client, socket))

        this.attachReceivers()
        this.attachEmitters()
    }

    attachReceivers() {
        this.socket.on("get:guilds",                    this.guildController.getGuilds.bind(this.guildController))
        this.socket.on("get:guild/channels",            this.guildController.getChannels.bind(this.guildController))
        this.socket.on("get:guild/member-count",        this.guildController.getMemberCount.bind(this.guildController))
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

        this.socket.on("post:subscribe/members",        this.subscriptionController.subscribe.bind(this.subscriptionController, "members"))
        this.socket.on("post:unsubscribe/members",      this.subscriptionController.unsubscribe.bind(this.subscriptionController, "members"))
        this.socket.on("post:subscribe/messages",       this.subscriptionController.subscribe.bind(this.subscriptionController, "messages"))
        this.socket.on("post:subscribe/voice",          this.subscriptionController.subscribe.bind(this.subscriptionController, "voice"))
    }

    attachEmitters() {
        this.emitter.forEach(emitter => emitter.attach())
    }
    
    destroy() {
        this.emitter.forEach(emitter => emitter.remove())
    }
}