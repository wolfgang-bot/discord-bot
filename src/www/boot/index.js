const glob = require("glob-promise")
const path = require("path")
const express = require("express")
const cors = require("cors")
const routes = require("../routes")

const ROOT_DIR = path.join(__dirname, "..")

async function boot(app, client) {
    setupExpress(app)
    await injectClient(client)
}

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