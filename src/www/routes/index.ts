import express from "express"
import { createProxyMiddleware } from "http-proxy-middleware"
import api from "./api"
import storage from "./storage"

const rootRouter = express.Router()

rootRouter.use("/api", api)
rootRouter.use("/storage", storage)

// Proxy frontend server
rootRouter.use("/", createProxyMiddleware({
    target: "http://localhost:3000/",
    // ws: true -> Crashes the dev-server when reloading via nodemon in combination with socket.io websocket
}))

export default rootRouter
