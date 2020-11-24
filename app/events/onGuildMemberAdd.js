const User = require("../Models/User.js")
const Member = require("../Models/Member.js")
const Guild = require("../Models/Guild.js")

async function run(client, member) {
    // Fetch the user role
    const config = await Guild.config(member.guild)
    const roles = await member.guild.roles.fetch()
    const userRole = roles.cache.find(role => role.name === config.userRole)
    
    // Assign the user role to the new user
    if (!userRole) {
        console.error(`The role '${config.userRole}' does not exist`)
    } else {
        await member.roles.add(userRole)
    }

    // Create user if not exists
    let user = await User.findBy("id", member.user.id)
    if (!user) {
        user = new User({ id: member.user.id })
        await user.store()
    }

    
    // Create member for user
    const model = new Member({
        user_id: member.user.id,
        guild_id: member.guild.id
    })
    await model.store()
}

module.exports = run