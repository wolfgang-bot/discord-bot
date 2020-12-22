import { io } from "socket.io-client"

class WebSocketAPI {
    static endpoint = "ws://localhost:8080"
    static socket = null

    /**
     * Log into websocket api
     * 
     * @param {String} token 
     */
    static async login(token) {
        this.socket = io(this.endpoint, {
            auth: {
                token
            }
        })

        await new Promise((resolve, reject) => {
            this.socket.on("connect", resolve)
            this.socket.on("connect_error", reject)
        })
    }
}

export default WebSocketAPI