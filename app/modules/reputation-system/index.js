const Module = require("../../lib/Module.js")
const LocaleServiceProvider = require("../../services/LocaleServiceProvider.js")
const CommandRegistry = require("../../services/CommandRegistry.js")
const Configuration = require("./Configuration.js")
const ReputationManager = require("./managers/ReputationManager.js")

const commands = [
    require("./commands/leaderboard.js"),
    require("./commands/profile.js")
]

class ReputationSystemModule extends Module {
    static async fromConfig(client, guild, config) {
        const channel = await guild.channels.cache.get(config.channelId)

        return new ReputationSystemModule(client, guild, new Configuration({ channel }))
    }

    static async fromArguments(client, guild, args) {
        const locale = await LocaleServiceProvider.guild(guild)

        if (!args[0]) {
            throw locale.translate("error_missing_argument", "textchannel")
        }

        const channel = guild.channels.cache.get(args[0])

        if (!channel) {
            throw locale.translate("module_reputation_system_error_textchannel_does_not_exist")
        }

        const config = new Configuration({ channel })
        return new ReputationSystemModule(client, guild, config)
    }

    constructor(client, guild, config) {
        super()

        this.client = client
        this.guild = guild
        this.config = config

        this.reputationManager = new ReputationManager(this.client, this.guild, this.config.channel)
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

ReputationSystemModule.meta = {
    description: "module_reputation_system_desc",
    arguments: "module_reputation_system_args",
    features: "module_reputation_system_features"
}

module.exports = ReputationSystemModule