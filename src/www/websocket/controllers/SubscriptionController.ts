import Discord from "discord.js"
import log from "loglevel"
import WebSocketController from "../../../lib/WebSocketController"
import StreamManager, { EVENT_STREAMS, SubscriptionArgs } from "../StreamManager"
import { AuthorizedSocket } from "../SocketManager"
import { success, error } from "../responses"

export default class SubscriptionController extends WebSocketController {
    constructor(
        client: Discord.Client,
        socket: AuthorizedSocket,
        private streamManager: StreamManager
    ) {
        super(client, socket)
    }

    subscribe(eventStream: EVENT_STREAMS, args: SubscriptionArgs, send: Function) {
        this.forwardEvent(this.streamManager.subscribe.bind(this.streamManager), eventStream, args, send)
    }

    unsubscribe(eventStream: EVENT_STREAMS, args: SubscriptionArgs, send: Function) {
        this.forwardEvent(this.streamManager.unsubscribe.bind(this.streamManager), eventStream, args, send)
    }

    pause(eventStream: EVENT_STREAMS, args: SubscriptionArgs, send: Function) {
        this.forwardEvent(this.streamManager.pause.bind(this.streamManager), eventStream, args, send)
    }

    resume(eventStream: EVENT_STREAMS, args: SubscriptionArgs, send: Function) {
        this.forwardEvent(this.streamManager.resume.bind(this.streamManager), eventStream, args, send)
    }

    async forwardEvent(
        forwardedFunction: (args: SubscriptionArgs) => void,
        eventStream: EVENT_STREAMS,
        args: SubscriptionArgs,
        send: Function
    ) {
        args.eventStream = eventStream

        if (!args.eventStream || !args.guildId) {
            send = arguments[arguments.length - 1]
            return send(error(400))
        }

        const guild = await this.client.guilds.fetch(args.guildId)

        if (!guild) {
            return send(error(404))
        }

        if (!this.socket.user.isAdmin(guild)) {
            return send(error(403))
        }

        try {
            forwardedFunction(args)
            send(success())
        } catch (error) {
            log.debug(error)
            return send(error(500))
        }
    }
}
