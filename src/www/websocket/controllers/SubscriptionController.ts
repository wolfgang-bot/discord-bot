import Discord from "discord.js"
import log from "loglevel"
import WebSocketController from "../../../lib/WebSocketController"
import StreamSubscriber from "../StreamSubscriber"
import { AuthorizedSocket } from "../SocketManager"
import { success, error } from "../responses"
import StreamAuthorizer from "../StreamAuthorizer"
import { SubscriptionArgs } from "../types"

export default class SubscriptionController extends WebSocketController {
    constructor(
        client: Discord.Client,
        socket: AuthorizedSocket,
        private streamSubscriber: StreamSubscriber
    ) {
        super(client, socket)
    }

    subscribe(args: SubscriptionArgs, send: Function) {
        this.forwardEvent(
            this.streamSubscriber.subscribe.bind(this.streamSubscriber),
            args,
            send
        )
    }

    unsubscribe(args: SubscriptionArgs, send: Function) {
        this.forwardEvent(
            this.streamSubscriber.unsubscribe.bind(this.streamSubscriber),
            args,
            send
        )
    }

    pause(args: SubscriptionArgs, send: Function) {
        this.forwardEvent(
            this.streamSubscriber.pause.bind(this.streamSubscriber),
            args,
            send
        )
    }

    resume(args: SubscriptionArgs, send: Function) {
        this.forwardEvent(
            this.streamSubscriber.resume.bind(this.streamSubscriber),
            args,
            send
        )
    }

    async forwardEvent(
        forwardedFunction: (args: SubscriptionArgs) => void,
        args: SubscriptionArgs,
        send: Function
    ) {
        if (typeof args !== "object") {
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
        } catch (err) {
            log.debug(err)
            return send(error(500))
        }
    }
}
