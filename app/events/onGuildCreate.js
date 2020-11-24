const Guild = require("../Models/Guild.js")

async function run(client, guild) {
    const model = new Guild({ guild_id: guild.id })
    await model.store()
}

module.exports = run