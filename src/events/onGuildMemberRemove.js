const Member = require("../models/Member.js")

async function run(client, member) {
    if (member.user.bot) {
        return
    }

    // Delete member from database
    const model = await Member.where(`user_id = '${member.user.id}' AND guild_id = '${member.guild.id}'`)
    if (model) {
        await model.delete()
    }

    // Delete user from database if he has no members anymore
    const members = await Member.findAllBy("user_id", member.user.id)
    if (members.length === 0) {
        await model.fetchUser()
        await model.user.delete()
    }
}

module.exports = run