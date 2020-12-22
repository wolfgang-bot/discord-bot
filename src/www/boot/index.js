const glob = require("glob-promise")
const path = require("path")
const express = require("express")
const cors = require("cors")

const routes = require("../routes")
const SocketManager = require("../websocket/SocketManager.js")

const ROOT_DIR = path.join(__dirname, "..")

async function boot({ app, websocket, client }) {
    setupExpress(app)
    setupWebSocket(websocket, client)
    await injectClient(client)
}

/**
 * Setup express related components
 */
function setupExpress(app) {
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
function setupWebSocket(websocket, client) {
    const manager = new SocketManager(websocket, client)
    manager.init()
}

/**
 * Inject client into dependants
 */
async function injectClient(client) {
    const files = await glob("{controllers,middleware}/*.js", { cwd: ROOT_DIR })

    files.forEach(filepath => {
        const module = require(path.join(ROOT_DIR, filepath))

        if (module.setDiscordClient) {
            module.setDiscordClient(client)
        }
    })
}

module.exports = boot