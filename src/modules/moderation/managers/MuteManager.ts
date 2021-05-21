import Discord from "discord.js"
import Manager from "../../../lib/Manager"
import MuteRoleManager from "./MuteRoleManager"

class MuteManager extends Manager {
    muteRoleManager = new MuteRoleManager(this.context, this.config)

    async muteMember(member: Discord.GuildMember) {
        await member.roles.add(this.muteRoleManager.getRole())
    }

    async unmuteMember(member: Discord.GuildMember) {
        await member.roles.remove(this.muteRoleManager.getRole())
    }

    async init() {
        await this.muteRoleManager.init()
    }

    async delete() {
        await this.muteRoleManager.delete()
    }
}

export default MuteManager
