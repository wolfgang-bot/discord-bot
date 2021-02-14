import { Writable } from "../../../lib/Stream"
import { AuthorizedSocket } from "../SocketManager"

export default class SocketWriteStream<T> extends Writable<T> {
    constructor(public socket: AuthorizedSocket, public eventName: string) {
        super()
    }

    write(data: T) {
        this.socket.emit(`push:stream/${this.eventName}`, data)
    }
}