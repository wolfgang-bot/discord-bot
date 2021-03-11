import Discord from "discord.js"
import DefaultConfig from "../../../lib/Configuration"

type ConfigProps = {
    userRole: Discord.Role,
    assignRoleToEachUser: boolean
}

export default class Configuration extends DefaultConfig implements ConfigProps {
    userRole: Discord.Role
    assignRoleToEachUser: boolean
    
    toJSON() {
        return {
            ...this,
            userRole: this.userRole.id
        }
    }
}
