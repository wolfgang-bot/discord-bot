import Module from "../../lib/Module"
import { module, argument, command } from "../../lib/decorators"
import { TYPES as ARGUMENT_TYPES } from "../../lib/Argument"
import Context from "../../lib/Context"
import CommandRegistry from "../../services/CommandRegistry"
import Configuration from "./models/Configuration"
import ReputationManager from "./managers/ReputationManager"
import LeaderboardCommand from "./commands/leaderboard"
import ProfileCommand from "./commands/profile"

@module({
    key: "reputation-system",
    name: "Reputation System",
    desc: "Manages the reputation and the level roles of the users.",
    features: [
        "Creates a new role for every level with a unique color.",
        "Allows other modules to give reputation to specific users.",
        "Sends a message into the notifications channel when a user reaches the next level."
    ]
})
@argument({
    type: ARGUMENT_TYPES.TEXT_CHANNEL,
    key: "channel",
    name: "Notifications Channel",
    desc: "arg_notifications_channel_desc",
})
@argument({
    type: ARGUMENT_TYPES.STRING,
    isArray: true,
    key: "roles",
    name: "Roles",
    desc: "arg_roles_desc",
    defaultValue: ["Bronze", "Silver", "Gold", "Platinum", "Diamond"]
})
@argument({
    type: ARGUMENT_TYPES.STRING,
    isArray: true,
    key: "roleColors",
    name: "Role Colors",
    desc: "arg_role_colors_desc",
    defaultValue: ["#E67E22", "#ffffff", "#F0C410", "#607d8b", "#3498DB"]
})
@argument({
    type: ARGUMENT_TYPES.NUMBER,
    isArray: true,
    key: "roleThresholds",
    name: "Role Thresholds",
    desc: "arg_role_thresholds_desc",
    defaultValue: [10, 100, 500, 1000, 2500]
})
@argument({
    type: ARGUMENT_TYPES.STRING,
    key: "levelUpReactionEmoji",
    name: "Level Up Reaction Emoji",
    desc: "arg_level_up_reaction_emoji_desc",
    defaultValue: "💯"
})
@command(LeaderboardCommand)
@command(ProfileCommand)
export default class ReputationSystemModule extends Module {
    static config = Configuration

    config: Configuration
    reputationManager: ReputationManager

    constructor(context: Context, config: Configuration) {
        super(context, config)
        this.commands = ReputationSystemModule.createCommands()
    }

    async start() {
        this.registerCommands()

        this.reputationManager = new ReputationManager(this.context, this.config)
        await this.reputationManager.init()
    }
    
    async stop() {
        this.unregisterCommands()

        CommandRegistry.guild(this.context.guild).unregister(this.commands)
        await this.reputationManager.delete()
    }
}
