import * as Discord from "discord.js"
import { InternalSocket } from "../www/websocket/SocketManager"

export default abstract class WebSocketController {
    client: Discord.Client
    socket: InternalSocket

    constructor(client: Discord.Client, socket: InternalSocket) {
        this.client = client
        this.socket = socket
    }
}