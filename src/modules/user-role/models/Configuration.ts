import Discord from "discord.js"
import DefaultConfig from "../../../lib/Configuration"
import DescriptiveObject from "../../../lib/DescriptiveObject"

type ConfigProps = {
    userRole: Discord.Role
}

export default class Configuration extends DefaultConfig implements ConfigProps {
    userRole: Discord.Role

    static guildConfig = new DescriptiveObject({
        value: {}
    })
    
    toJSON() {
        return {
            ...this,
            userRole: this.userRole.id
        }
    }
}
