import Discord from "discord.js"
import DefaultConfig from "../../../lib/Configuration"

type ConfigProps = {
    userRole: Discord.Role
}

export default class Configuration extends DefaultConfig implements ConfigProps {
    userRole: Discord.Role
    
    toJSON() {
        return {
            ...this,
            userRole: this.userRole.id
        }
    }
}
