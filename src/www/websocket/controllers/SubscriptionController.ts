import Discord from "discord.js"
import log from "loglevel"
import WebSocketController from "../../../lib/WebSocketController"
import StreamManager, { EVENT_STREAMS, SubscriptionArgs } from "../StreamManager"
import { AuthorizedSocket } from "../SocketManager"
import { success, error } from "../responses"
import StreamAuthorizer from "../StreamAuthorizer"

export default class SubscriptionController extends WebSocketController {
    constructor(
        client: Discord.Client,
        socket: AuthorizedSocket,
        private streamManager: StreamManager
    ) {
        super(client, socket)
    }

    subscribe(args: SubscriptionArgs, send: Function) {
        this.forwardEvent(
            this.streamManager.subscribe.bind(this.streamManager),
            args,
            send
        )
    }

    unsubscribe(args: SubscriptionArgs, send: Function) {
        this.forwardEvent(
            this.streamManager.unsubscribe.bind(this.streamManager),
            args,
            send
        )
    }

    pause(args: SubscriptionArgs, send: Function) {
        this.forwardEvent(
            this.streamManager.pause.bind(this.streamManager),
            args,
            send
        )
    }

    resume(args: SubscriptionArgs, send: Function) {
        this.forwardEvent(
            this.streamManager.resume.bind(this.streamManager),
            args,
            send
        )
    }

    async forwardEvent(
        forwardedFunction: (args: SubscriptionArgs) => void,
        args: SubscriptionArgs,
        send: Function
    ) {
        if (!args.eventStream || !args.guildId) {
            send = arguments[arguments.length - 1]
            return send(error(400))
        }

        const streamAuthorizer = new StreamAuthorizer(
            this.client,
            this.socket.user
        )
        const authErrorCode = await streamAuthorizer.authorize(args)

        if (authErrorCode) {
            return send(error(authErrorCode))
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
