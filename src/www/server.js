const express = require("express")
const http = require("http")
const { Server: WebSocketServer } = require("socket.io")

const boot = require("./boot")

const app = express()
const server = http.createServer(app)
const websocket = new WebSocketServer(server, {
    serveClient: false,

    cors: process.env.NODE_ENV === "development" ? {
        origin: "*",
        methods: ["GET", "POST"]
    } : {}
})

async function start(client) {
    await boot({ app, websocket, client })

    // Start server on port specified in .env
    server.listen(process.env.PORT, () => {
        console.log("Server is running on port", process.env.PORT)
    })
}

module.exports = start