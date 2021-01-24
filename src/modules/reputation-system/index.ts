import Module from "../../lib/Module"
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

class ReputationSystemModule extends Module {
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

module.exports = ReputationSystemModule