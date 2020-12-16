const fs = require("fs")
const path = require("path")
const express = require("express")
const { createProxyMiddleware } = require("http-proxy-middleware")

const ROOT_DIR = path.join(__dirname, "..")

const rootRouter = express.Router()

/**
 * Create routes from files in current directory
 */
const routes = fs.readdirSync(__dirname)
                .filter(filename => filename !== "index.js")
                .map(filename => [filename.slice(0, -3), require("./" + filename)])

for(let [route, router] of routes) {
    rootRouter.use("/" + route, router)
}

/**
 * Serve react app
 */
if (process.env.NODE_ENV === "development") {
    // Proxy react dev-server
    rootRouter.use("/", createProxyMiddleware({
        target: "http://localhost:3000/",
        ws: true
    }))
} else {
    rootRouter.get("/*", (req, res) => res.sendFile(path.resolve(ROOT_DIR, "public", "index.html")))
}

module.exports = rootRouter
