import Discord from "discord.js"
import { argument, module } from "../../lib/decorators"
import Module from "../../lib/Module"
import Configuration from "./models/Configuration"
import { TYPES as ARGUMENT_TYPES } from "../../lib/Argument"
import Context from "../../lib/Context"

@module({
    key: "user-role",
    name: "meta_name",
    desc: "meta_desc",
    features: "meta_features"
})
@argument({
    type: ARGUMENT_TYPES.ROLE,
    key: "user_role_id",
    name: "arg_user_role_name",
    desc: "arg_user_role_desc"
})
export default class UserRoleModule extends Module {
    static makeConfigFromArgs = Configuration.fromArgs
    static makeConfigFromJSON = Configuration.fromJSON

    config: Configuration

    constructor(context: Context, config: Configuration) {
        super(context, config)

        this.handleGuildMemberAdd = this.handleGuildMemberAdd.bind(this)
    }

    async start() {
        await this.assignRoleToEachUser()
        this.context.client.on("guildMemberAdd", this.handleGuildMemberAdd)
    }

    async stop() {
        this.context.client.removeListener("guildMemberAdd", this.handleGuildMemberAdd)
    }

    async assignRoleToEachUser() {
        const members = await this.context.guild.members.fetch()
        await Promise.all(members.map(
            member => member.roles.add(this.config.userRole)
        ))
    }

    async handleGuildMemberAdd(member: Discord.GuildMember) {
        await member.roles.add(this.config.userRole)
    }
}
