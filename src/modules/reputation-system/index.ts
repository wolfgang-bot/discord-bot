import Module from "../../lib/Module"
import { module, argument } from "../../lib/decorators"
import { TYPES as ARGUMENT_TYPES } from "../../lib/Argument"
import CommandRegistry from "../../services/CommandRegistry"
import Configuration from "./models/Configuration"
import ReputationManager from "./managers/ReputationManager"
import LeaderboardCommand from "./commands/leaderboard"
import ProfileCommand from "./commands/profile"

const commands = [
    new LeaderboardCommand(),
    new ProfileCommand()
]

commands.forEach(command => command.module = "reputation-system")

@module({
    key: "reputation-system",
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

    config: Configuration
    reputationManager: ReputationManager

    async start() {
        this.reputationManager = new ReputationManager(this.context, this.config)

        commands.forEach(command => CommandRegistry.root.register(command))
        
        await this.reputationManager.init()
    }
    
    async stop() {
        commands.forEach(command => CommandRegistry.root.unregister(command))

        await this.reputationManager.delete()
    }

    getConfig() {
        return this.config
    }
}