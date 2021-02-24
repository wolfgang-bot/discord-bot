import Module from "@personal-discord-bot/shared/dist/module/Module"
import { module, argument } from "@personal-discord-bot/shared/dist/module/decorators"
import { TYPES as ARGUMENT_TYPES } from "@personal-discord-bot/shared/dist/module/Argument"
import Context from "@personal-discord-bot/shared/dist/module/Context"
import { Command } from "@personal-discord-bot/shared/dist/command"
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
    key: "notifications_channel_id",
    name: "arg_notifications_channel_display_name",
    desc: "arg_notifications_channel_desc",
})
export default class ReputationSystemModule extends Module {
    static makeConfigFromArgs = Configuration.fromArgs
    static makeConfigFromJSON = Configuration.fromJSON
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
