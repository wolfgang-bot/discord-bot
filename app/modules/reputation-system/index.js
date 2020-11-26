const Module = require("../../lib/Module.js")
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
        if (!args[0]) {
            throw "Kein Textkanal angegeben"
        }

        const channel = guild.channels.cache.get(args[0])

        if (!channel) {
            throw "Der Textkanal existiert nicht"
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
        commands.forEach(command => CommandRegistry.register(command))
        
        this.reputationManager.init()
    }
    
    async stop() {
        commands.forEach(command => CommandRegistry.unregister(command))

        this.reputationManager.delete()
    }

    getConfig() {
        return this.config
    }
}

ReputationSystemModule.meta = {
    description: "Verwaltet die Punkte sowie die Level-Rollen der Benutzer.",
    arguments: "<benachrichtigungskanal_id>",
    features: [
        "Erstellt für jedes Level eine neue Rolle mit einer individuellen Farbe.",
        "Erstellt ein neues Discord Event, das von anderen Modulen verwendet werden kann, um Benutzern Punkte zu geben.",
        "Sendet eine Nachricht in den Benachrichtigungskanal, wenn ein Benutzer ein neues Level erreicht.",
        "Erstellt die Commands: 'leaderboard' und 'profile'."
    ]
}

module.exports = ReputationSystemModule