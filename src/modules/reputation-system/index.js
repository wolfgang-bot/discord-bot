const CommandRegistry = require("../../services/CommandRegistry.js")
const Configuration = require("./models/Configuration.js")
const ReputationManager = require("./managers/ReputationManager.js")

const commands = [
    require("./commands/leaderboard.js"),
    require("./commands/profile.js")
]

commands.forEach(command => command.setModule("reputation-system"))

class ReputationSystemModule {
    static makeConfigFromArgs = Configuration.fromArgs
    static makeConfigFromJSON = Configuration.fromJSON

    constructor(context, config) {
        this.context = context
        this.config = config

        this.reputationManager = new ReputationManager(this.context, this.config.channel)
    }

    async start() {
        commands.forEach(command => CommandRegistry.root.register(command))
        
        this.reputationManager.init()
    }
    
    async stop() {
        commands.forEach(command => CommandRegistry.root.unregister(command))

        this.reputationManager.delete()
    }

    getConfig() {
        return this.config
    }
}

module.exports = ReputationSystemModule