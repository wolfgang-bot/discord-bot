const express = require("express")
const boot = require("./boot")

const app = express()

async function start(client) {
    await boot(app, client)

    // Start server on port specified in .env
    app.listen(process.env.PORT, () => {
        console.log("Server is running on port", process.env.PORT)
    })
}

module.exports = start