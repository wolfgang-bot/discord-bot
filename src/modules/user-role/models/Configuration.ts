import Discord from "discord.js"
import DefaultConfig from "../../../lib/Configuration"
import Context from "../../../lib/Context"

type ConfigProps = {
    userRole: Discord.Role
}

type ConfigArgs = [Discord.Role]

type ConfigJSON = {
    userRoleId: string
}

export default class Configuration extends DefaultConfig implements ConfigProps {
    static fromArgs(args: ConfigArgs) {
        return new Configuration({ userRole: args[0] })
    }

    static async fromJSON(context: Context, config: ConfigJSON) {
        const userRole = await context.guild.roles.fetch(config.userRoleId)
        return new Configuration({ userRole })
    }
    
    userRole: Discord.Role
    
    constructor(props: ConfigProps) {
        super(props)
    }

    toJSON(): ConfigJSON {
        return {
            userRoleId: this.userRole.id
        }
    }
}
