import * as Discord from "discord.js"
import express, { Request } from "express"
import http from "http"
import { Server as WebSocketServer } from "socket.io"
import User from "../models/User"
import boot from "./boot"

export type InternalRequest = Request & {
    user: User
}

const app = express()
const server = http.createServer(app)
const websocket = new WebSocketServer(server, {
    serveClient: false,

    cors: process.env.NODE_ENV === "development" ? {
        origin: "*",
        methods: ["GET", "POST"]
    } : {}
})

export default async function start(client: Discord.Client) {
    await boot({ app, websocket, client })

    // Start server on port specified in .env
    server.listen(process.env.PORT, () => {
        console.log("Server is running on port", process.env.PORT)
    })
}