import Discord from "discord.js"
import WebSocketController from "../../../lib/WebSocketController"
import StreamManager, { EVENT_STREAMS } from "../StreamManager"
import { AuthorizedSocket } from "../SocketManager"
import { success, error } from "../responses"

export type SubscriptionArgs = {
    eventStream: EVENT_STREAMS,
    guildId: string
}

export default class SubscriptionController extends WebSocketController {
    constructor(
        client: Discord.Client,
        socket: AuthorizedSocket,
        private streamManager: StreamManager
    ) {
        super(client, socket)
    }

    async subscribe(eventStream: EVENT_STREAMS, args: SubscriptionArgs, send: Function) {
        args.eventStream = eventStream

        if (!args.eventStream || !args.guildId) {
            send = arguments[arguments.length - 1]
            return send(error(400))
        }

        const guild = await this.client.guilds.fetch(args.guildId)
        if (!this.socket.user.isAdmin(guild)) {
            return send(error(403))
        }

        try {
            this.streamManager.subscribe(args)
            send(success())
        } catch (err) {
            console.error(err)
            send(error(500))
        }
    }

    async unsubscribe(eventStream: EVENT_STREAMS, args: SubscriptionArgs, send: Function) {
        args.eventStream = eventStream

        if (!args.eventStream || !args.guildId) {
            send = arguments[arguments.length - 1]
            return send(error(400))
        }

        try {
            this.streamManager.unsubscribe(args)
            send(success())
        } catch (error) {
            console.log(error)
            return send(error(500))
        }
    }
}