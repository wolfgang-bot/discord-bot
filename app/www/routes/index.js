const fs = require("fs")
const path = require("path")
const express = require("express")

const ROOT_DIR = path.join(__dirname, "..")

const router = express.Router()

/**
 * Create routes from files in current directory
 */
const routes = fs.readdirSync(__dirname)
    .filter(filename => filename !== "index.js")
    .map(filename => [filename.slice(0, -3), require("./" + filename)])

for (let [route, _router] of routes) {
    router.use("/" + route, _router)
}

/**
 * Serve static files
 */
router.use(express.static(path.join(ROOT_DIR, "public")))

module.exports = router