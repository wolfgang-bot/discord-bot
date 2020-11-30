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
    const files = await glob("controllers/*.js", { cwd: ROOT_DIR })

    files.forEach(filepath => {
        const module = require(path.join(ROOT_DIR, filepath))
        module.setDiscordClient(client)
    })
}

module.exports = boot