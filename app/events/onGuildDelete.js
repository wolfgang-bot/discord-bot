const Guild = require("../models/Guild.js")

async function run(client, guild) {
    const model = await Guild.findBy("id", guild.id)

    if (model) {
        await model.delete()
    }
}

module.exports = run