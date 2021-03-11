import Discord from "discord.js"
import { argument, module } from "../../lib/decorators"
import Module from "../../lib/Module"
import Configuration from "./models/Configuration"
import { TYPES as ARGUMENT_TYPES } from "../../lib/Argument"
import Context from "../../lib/Context"

@module({
    key: "user-role",
    name: "User Role",
    desc: "Gives a role to each user",
    features: [
        "Assigns a role to each existing user on startup",
        "Assigns a role to each user who joins the guild"
    ]
})
@argument({
    type: ARGUMENT_TYPES.ROLE,
    key: "userRole",
    name: "User Role",
    desc: "The role which will be assigned to each user"
})
@argument({
    type: ARGUMENT_TYPES.BOOLEAN,
    key: "assignRoleToEachUser",
    name: "Assign Role",
    desc: "Assign the role to each user on startup",
    defaultValue: true
})
export default class UserRoleModule extends Module {
    static config = Configuration

    config: Configuration

    constructor(context: Context, config: Configuration) {
        super(context, config)

        this.handleGuildMemberAdd = this.handleGuildMemberAdd.bind(this)
    }

    async start() {
        if (this.config.assignRoleToEachUser) {
            await this.assignRoleToEachUser()
        }

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
