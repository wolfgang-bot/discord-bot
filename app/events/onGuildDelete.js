const Guild = require("../Models/Guild.js")

async function run(client, guild) {
    const model = await Guild.findBy("guild_id", guild.id)

    if (model) {
        await model.delete()
    }
}

module.exports = run