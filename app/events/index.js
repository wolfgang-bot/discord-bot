const glob = require("glob-promise")
const path = require("path")

function attachEvents(client) {
    const files = glob.sync("!(index).js", { cwd: __dirname })

    // Attach events from this folder
    files.forEach(filename => {
        let event = filename.replace(/(^on|.js$)/g, "")
        event = event.charAt(0).toLowerCase() + event.slice(1)

        const run = require(path.join(__dirname, filename)).bind(null, client)

        client.on(event, run)
    })
}

module.exports = attachEvents