import Discord from "discord.js"
import { AuthorizedSocket } from "./SocketManager"
import StreamSubscriber from "./StreamSubscriber"
import GuildController from "./controllers/GuildController"
import ModuleController from "./controllers/ModuleController"
import SubscriptionController from "./controllers/SubscriptionController"

export default class ConnectionManager {
    socket: AuthorizedSocket
    client: Discord.Client

    guildController: GuildController
    moduleController: ModuleController
    subscriptionController: SubscriptionController

    streamSubscriber: StreamSubscriber

    constructor(socket: AuthorizedSocket, client: Discord.Client) {
        this.socket = socket
        this.client = client

        this.streamSubscriber = new StreamSubscriber(client, socket)

        this.guildController = new GuildController(client, socket)
        this.moduleController = new ModuleController(client, socket)
        this.subscriptionController = new SubscriptionController(client, socket, this.streamSubscriber)

        this.attachReceivers()
    }

    attachReceivers() {
        this.socket.on("get:guild/member-count",        this.guildController.getMemberCount.bind(this.guildController))
        this.socket.on("get:guild/channels",            this.guildController.getChannels.bind(this.guildController))
        this.socket.on("get:guild/roles",               this.guildController.getRoles.bind(this.guildController))

        this.socket.on("get:modules",                   this.moduleController.getModules.bind(this.moduleController))
        this.socket.on("get:module-instances",          this.moduleController.getInstances.bind(this.moduleController))
        this.socket.on("post:module-instances/start",   this.moduleController.startInstance.bind(this.moduleController))
        this.socket.on("post:module-instances/stop",    this.moduleController.stopInstance.bind(this.moduleController))
        this.socket.on("post:module-instances/restart", this.moduleController.restartInstance.bind(this.moduleController))
        this.socket.on("post:module-instances/config",  this.moduleController.updateConfig.bind(this.moduleController))

        this.socket.on("post:stream/subscribe",         this.subscriptionController.subscribe.bind(this.subscriptionController))
        this.socket.on("post:stream/unsubscribe",       this.subscriptionController.unsubscribe.bind(this.subscriptionController))
        this.socket.on("post:stream/pause",             this.subscriptionController.pause.bind(this.subscriptionController))
        this.socket.on("post:stream/resume",            this.subscriptionController.resume.bind(this.subscriptionController))
    }

    destroy() {
        this.streamSubscriber.unsubscribeAll()
    }
}
