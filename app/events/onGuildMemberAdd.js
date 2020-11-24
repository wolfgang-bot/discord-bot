const User = require("../Models/User.js")
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
    
    // Store the new user in the database
    const model = new User({
        user_id: member.user.id,
        guild_id: member.guild.id
    })
    await model.store()
}

module.exports = run