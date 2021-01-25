import * as Discord from "discord.js"
import express from "express"
import { Server as WebSocketServer } from "socket.io"
import glob from "glob-promise"
import path from "path"
import cors from "cors"
import routes from "../routes"
import SocketManager from "../websocket/SocketManager.js"

type BootProps = {
    app: express.Application
    websocket: WebSocketServer
    client: Discord.Client
}

const ROOT_DIR = path.join(__dirname, "..")

export default async function boot({ app, websocket, client }: BootProps) {
    setupExpress(app)
    setupWebSocket(websocket, client)
    await injectClient(client)
}

/**
 * Setup express related components
 */
function setupExpress(app: express.Application) {
    if (process.env.NODE_ENV === "development") {
        app.use(cors())
    }

    // Set pug as template engine
    app.set("view engine", "pug")
    app.set("views", path.join(__dirname, "..", "views"))

    // Support json
    app.use(express.json())
    
    // Support form data
    app.use(express.urlencoded({
        extended: true
    }))

    // Use Routes
    app.use("/", routes)
}

/**
 * Setup WebSocket server
 */
function setupWebSocket(websocket: WebSocketServer, client: Discord.Client) {
    const manager = new SocketManager(websocket, client)
    manager.init()
}

/**
 * Inject client into dependants
 */
async function injectClient(client: Discord.Client) {
    const files = await glob("{controllers,middleware}/*.js", { cwd: ROOT_DIR })

    files.forEach(filepath => {
        const module = require(path.join(ROOT_DIR, filepath))

        if (module.setDiscordClient) {
            module.setDiscordClient(client)
        }
    })
}