const User = require("../Models/User.js")

async function run(client, member) {
    const model = new User({ id: member.user.id })
    await model.store()
}

module.exports = run