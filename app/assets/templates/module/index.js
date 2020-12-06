const CommandRegistry = require("../../services/CommandRegistry.js")
const Configuration = require("./Configuration.js")
const Manager = require("./managers/Manager.js")

const commands = [
    require("./commands/command.js")
]

class ReputationSystemModule extends Module {
    static async fromConfig(client, guild, config) {
        return new ReputationSystemModule(client, guild, new Configuration({  }))
    }

    static async fromArguments(client, guild, args) {
        const config = new Configuration({  })
        return new ReputationSystemModule(client, guild, config)
    }

    constructor(client, guild, config) {
        super()

        this.client = client
        this.guild = guild
        this.config = config

        this.manager = new Manager(this.client, this.guild)
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
    description: "Desribe in one, short sentence, what the module does.",
    arguments: "<argument_1> <argument_2> ...",
    features: [
        "Write a list of all the amazing features",
        "Which you have implemented into the module"
    ]
}

module.exports = ReputationSystemModule