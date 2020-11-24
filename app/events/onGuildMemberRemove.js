const User = require("../Models/User.js")
const Member = require("../Models/Member.js")

async function run(client, member) {
    // Delete member from database
    const model = await Member.where(`user_id = '${member.user.id}' AND guild_id = '${member.guild.id}'`)
    if (model) {
        await model.delete()
    }

    // Delete user from database if he has no members anymore
    const members = await Member.findAllBy("user_id", member.user.id)
    if (members.length === 0) {
        const user = await User.findBy("id", member.user.id)

        if (user) {
            await user.delete()
        }
    }
}

module.exports = run