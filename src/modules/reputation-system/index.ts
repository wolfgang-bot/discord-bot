import Module from "../../lib/Module"
import { module, argument } from "../../lib/decorators"
import { TYPES as ARGUMENT_TYPES } from "../../lib/Argument"
import Context from "../../lib/Context"
import Command from "../../lib/Command"
import CommandRegistry from "../../services/CommandRegistry"
import Configuration from "./models/Configuration"
import ReputationManager from "./managers/ReputationManager"
import LeaderboardCommand from "./commands/leaderboard"
import ProfileCommand from "./commands/profile"

@module({
    key: "reputation-system",
    name: "meta_name",
    desc: "meta_desc",
    features: "meta_features"
})
@argument({
    type: ARGUMENT_TYPES.TEXT_CHANNEL,
    key: "channel",
    name: "arg_notifications_channel_display_name",
    desc: "arg_notifications_channel_desc",
})
@argument({
    type: ARGUMENT_TYPES.STRING,
    isArray: true,
    key: "roles",
    name: "arg_roles_name",
    desc: "arg_roles_desc",
    defaultValue: ["Bronze", "Silver", "Gold", "Platinum", "Diamond"]
})
@argument({
    type: ARGUMENT_TYPES.STRING,
    isArray: true,
    key: "roleColors",
    name: "arg_role_colors_name",
    desc: "arg_role_colors_desc",
    defaultValue: ["#E67E22", "#ffffff", "#F0C410", "#607d8b", "#3498DB"]
})
@argument({
    type: ARGUMENT_TYPES.NUMBER,
    isArray: true,
    key: "roleThresholds",
    name: "arg_role_thresholds_name",
    desc: "arg_role_thresholds_desc",
    defaultValue: [10, 100, 500, 1000, 2500]
})
@argument({
    type: ARGUMENT_TYPES.STRING,
    key: "levelUpReactionEmoji",
    name: "arg_level_up_reaction_emoji_name",
    desc: "arg_level_up_reaction_emoji_desc",
    defaultValue: "💯"
})
export default class ReputationSystemModule extends Module {
    static config = Configuration
    static commands = ReputationSystemModule.createCommands()

    config: Configuration
    reputationManager: ReputationManager
    commands: Command[]

    static createCommands() {
        const commands: Command[] = [
            new LeaderboardCommand(),
            new ProfileCommand()
        ]

        commands.forEach(command => command.module = "reputation-system")

        return commands
    }

    constructor(context: Context, config: Configuration) {
        super(context, config)

        this.commands = ReputationSystemModule.createCommands()
    }

    async start() {
        this.reputationManager = new ReputationManager(this.context, this.config)

        CommandRegistry.guild(this.context.guild).register(this.commands)
        
        await this.reputationManager.init()
    }
    
    async stop() {
        CommandRegistry.guild(this.context.guild).unregister(this.commands)

        await this.reputationManager.delete()
    }

    getConfig() {
        return this.config
    }
}
