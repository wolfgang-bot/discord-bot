import Writable from "@personal-discord-bot/shared/dist/streams/Writable"
import { AuthorizedSocket } from "../SocketManager"
import { SubscriptionArgs } from "../StreamManager"

export default class SocketWriteStream<T> extends Writable<T> {
    constructor(public socket: AuthorizedSocket, public args: SubscriptionArgs) {
        super()
    }

    write(data: T) {
        this.socket.emit(`push:stream`, this.args, data)
    }
}
