import Discord from "discord.js"
import DefaultConfig from "../../../lib/Configuration"
import Context from "../../../lib/Context"
import DescriptiveObject from "../../../lib/DescriptiveObject"

type ConfigProps = {
    userRole: Discord.Role
}

type ConfigArgs = [Discord.Role]

type ConfigJSON = {
    userRoleId: string
}

export default class Configuration extends DefaultConfig implements ConfigProps {
    userRole: Discord.Role
    
    static fromArgs(args: ConfigArgs) {
        return new Configuration({ userRole: args[0] })
    }

    static async fromJSON(context: Context, config: ConfigJSON) {
        const userRole = await context.guild.roles.fetch(config.userRoleId)
        return new Configuration({ userRole })
    }

    static guildConfig = new DescriptiveObject({
        value: {}
    })
    
    constructor(props: ConfigProps) {
        super(props)
        this.userRole = props.userRole
    }

    toJSON(): ConfigJSON {
        return {
            userRoleId: this.userRole.id
        }
    }
}
