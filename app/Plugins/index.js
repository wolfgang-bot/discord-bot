const glob = require("glob")
const path = require("path")
const StorageFacade = require("../Facades/StorageFacade.js")

async function restore(client) {
    const files = glob.sync("?*/index.js", { cwd: __dirname })

    await Promise.all(files.map(async file => {
        const name = file.split("/")[0]
        const config = await StorageFacade.getItem("plugins." + name)
        
        if (config) {
            const Plugin = require(path.join(__dirname, file))
            const plugin = await Plugin.fromConfig(client, config)
            await plugin.init()
        }
    }))
}

module.exports = restore