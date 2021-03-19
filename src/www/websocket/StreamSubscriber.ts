import Discord from "discord.js"
import StreamRegistry from "./StreamRegistry"
import { AuthorizedSocket } from "./SocketManager"
import SocketStream from "./streams/SocketStream"
import { SubscriptionArgs } from "./types"

export default class StreamManager {
    streamRegistry: StreamRegistry = new StreamRegistry()

    constructor(public client: Discord.Client, public socket: AuthorizedSocket) {}

    subscribe(args: SubscriptionArgs) {
        this.assertStreamDoesNotExist(args)
        const eventStream = this.streamRegistry.createStream(args)
        const socketStream = new SocketStream(this.socket, args)        
        eventStream.pipe(socketStream)
    }

    unsubscribe(args: SubscriptionArgs) {
        this.assertStreamExists(args)
        this.streamRegistry.getStream(args).destroy()
        this.streamRegistry.deleteStream(args)
    }

    pause(args: SubscriptionArgs) {
        this.assertStreamExists(args)
        this.streamRegistry.getStream(args).pause()
    }

    resume(args: SubscriptionArgs) {
        this.assertStreamExists(args)
        this.streamRegistry.getStream(args).resume()
    }

    unsubscribeAll() {
        this.streamRegistry.forEachStream(stream => stream.destroy())
        this.streamRegistry.clearStreams()
    }

    assertStreamExists(args: SubscriptionArgs) {
        if (!this.streamRegistry.getStream(args)) {
            throw new Error(`Not subscribed to stream ${args.eventStream}`)
        }
    }

    assertStreamDoesNotExist(args: SubscriptionArgs) {
        if (this.streamRegistry.getStream(args)) {
            throw new Error(`Already subscribed to stream ${args.eventStream}`)
        }
    }
}
