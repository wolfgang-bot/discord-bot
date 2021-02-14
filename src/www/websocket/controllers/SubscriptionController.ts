import Discord from "discord.js"
import WebSocketController from "../../../lib/WebSocketController"
import { AuthorizedSocket } from "../SocketManager"
import { success, error } from "../responses"
import Event, { EVENT_TYPES } from "../../../models/Event"
import StreamManager from "../StreamManager"

export enum EVENT_STREAMS {
    MEMBERS = "members",
    MESSAGES = "messages",
    VOICE = "voice"
}

export type SubscriptionArgs = {
    eventStream: EVENT_STREAMS,
    guildId: string
}

export default class SubscriptionController extends WebSocketController {
    streamManager: StreamManager

    constructor(
        client: Discord.Client,
        socket: AuthorizedSocket
    ) {
        super(client, socket)
        this.streamManager = new StreamManager(client, socket)
    }

    /**
     * Subscribe to an event-stream and send initial values
     */
    async subscribe(eventStream: EVENT_STREAMS, args: SubscriptionArgs, send: Function) {
        args.eventStream = eventStream

        if (!args.guildId) {
            return send(error(400, "Missing argument: guildId"))
        }

        try {
            const initialValue = await this.getInitialValue(args)
            send(success(initialValue))
            this.streamManager.subscribe(args)
        } catch (err) {
            console.error(err)
            send(error(500))
        }
    }

    /**
     * Unsubscribe from event-stream
     */
    async unsubscribe(eventStream: EVENT_STREAMS, args: SubscriptionArgs) {
        args.eventStream = eventStream
        this.streamManager.unsubscribe(args)
    }

    /**
     * Get the initial value for any event-stream
     */
    getInitialValue(args: SubscriptionArgs) {
        if (args.eventStream === EVENT_STREAMS.MEMBERS) {
            return this.getMemberEvents(args)        
        }

        throw new Error(`Unknown event-stream: '${args.eventStream}'`)
    }

    async getMemberEvents(args: SubscriptionArgs) {
        // TODO: Move to config/constants file
        const maxResults = 1e5
        return await Event.whereAll(`
            (
                type = '${EVENT_TYPES.GUILD_MEMBER_ADD}' OR 
                type = '${EVENT_TYPES.GUILD_MEMBER_REMOVE}'
            ) AND guild_id = '${args.guildId}'
            ORDER BY timestamp ASC
            LIMIT ${maxResults}
        `)
    }
}