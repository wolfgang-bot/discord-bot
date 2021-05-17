import Discord from "discord.js"
import express from "express"
import { Server as WebSocketServer } from "socket.io"
import path from "path"
import routes from "../routes"
import SocketManager from "../websocket/SocketManager"

type BootProps = {
    app: express.Application
    websocket: WebSocketServer
    client: Discord.Client
}

const ROOT_DIR = path.join(__dirname, "..")

export default async function boot({ app, websocket, client }: BootProps) {
    setupExpress(app)
    setupWebSocket(websocket, client)
}

function setupExpress(app: express.Application) {
    // Set pug as template engine
    app.set("view engine", "pug")
    app.set("views", path.join(ROOT_DIR, "views"))

    // Support json
    app.use(express.json())
    
    // Support form data
    app.use(express.urlencoded({
        extended: true
    }))

    // Use Routes
    app.use("/", routes)
    
    app.disable("x-powered-by")
}

function setupWebSocket(websocket: WebSocketServer, client: Discord.Client) {
    const manager = new SocketManager(websocket, client)
    manager.init()
}
