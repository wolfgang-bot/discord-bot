import path from "path"
import express from "express"
import { createProxyMiddleware } from "http-proxy-middleware"
import api from "./api"
import storage from "./storage"

const ROOT_DIR = path.join(__dirname, "..")

const rootRouter = express.Router()

rootRouter.use("/api", api)
rootRouter.use("/storage", storage)

/**
 * Serve react app
 */
if (process.env.NODE_ENV === "development") {
    // Proxy react dev-server
    rootRouter.use("/", createProxyMiddleware({
        target: "http://localhost:3000/",
        // ws: true -> Crashes the dev-server when reloading via nodemon in combination with socket.io websocket
    }))
} else {
    rootRouter.get("/*", (req, res) => res.sendFile(path.resolve(ROOT_DIR, "public", "index.html")))
}

export default rootRouter
