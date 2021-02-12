import Discord from "discord.js"
import { AuthorizedSocket } from "../www/websocket/SocketManager"

export default abstract class WebSocketController {
    client: Discord.Client
    socket: AuthorizedSocket

    constructor(client: Discord.Client, socket: AuthorizedSocket) {
        this.client = client
        this.socket = socket
    }
}