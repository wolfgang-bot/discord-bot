const path = require("path")
const glob = require("glob-promise")
const express = require("express")
const handlebars = require("express-handlebars")
const routes = require("../routes")

const ROOT_DIR = path.join(__dirname, "..")

async function boot(app, client) {
    setupExpress(app, client)
    await injectClient(client)
}

function setupExpress(app) {
    // Set handlebars as the view engine
    app.engine("hbs", handlebars({
        extname: ".hbs"
    }))
    app.set("view engine", "hbs")

    // Set views directory
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
    const files = await glob("controllers/*.js", { cwd: ROOT_DIR })

    files.forEach(filepath => {
        const module = require(path.join(ROOT_DIR, filepath))
        module.setDiscordClient(client)
    })
}

module.exports = boot