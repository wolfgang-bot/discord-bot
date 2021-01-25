import * as Discord from "discord.js"
import User from "../../models/User"

/**
 * Check if a guild member has all permissions
 */
export async function checkPermissions(guild: Discord.Guild, user: User, permissions: Discord.PermissionString[]) {
    const member = await guild.members.fetch(user.id)
    return member.hasPermission(permissions)
}