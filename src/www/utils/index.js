/**
 * Check if a guild member has all permissions
 *
 * @param {Discord.Guild} guild
 * @param {User} user
 * @param {Array<String>} permissions
 */
async function checkPermissions(guild, user, permissions) {
    const member = await guild.members.fetch(user.id)
    return member.hasPermission(permissions)
}

module.exports = { checkPermissions }