const User = require("../Models/User.js")

async function run(client, member) {
    const model = await User.findBy("id", member.user.id)
    await model.delete()
}

module.exports = run