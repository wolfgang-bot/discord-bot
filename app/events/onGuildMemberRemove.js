const User = require("../Models/User.js")

async function run(client, member) {
    const model = await User.where(`user_id = '${member.user.id}' AND guild_id = '${member.guild.id}'`)

    if (model) {
        await model.delete()
    }
}

module.exports = run