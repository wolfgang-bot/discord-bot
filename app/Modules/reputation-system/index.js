const Module = require("../../lib/Module.js")
const Configuration = require("./Configuration.js")
const ReputationManager = require("./ReputationManager.js")

class ReputationSystemModule extends Module {
    static async fromConfig(client, guild, config) {
        const channel = await guild.channels.cache.get(config.channelId)

        return new ReputationSystemModule(client, guild, new Configuration({ channel }))
    }

    static async fromMessage(client, guild, message, args) {
        if (!args[0]) {
            await message.channel.send("Kein Textkanal angegeben")
            return
        }

        const channel = guild.channels.cache.get(args[0])

        if (!channel) {
            await message.channel.send("Der Textkanal existiert nicht")
            return
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
        this.reputationManager.init()
    }

    async stop() {
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
        "Sendet eine Nachricht in den Benachrichtigungskanal, wenn ein Benutzer ein neues Level erreicht."
    ]
}

module.exports = ReputationSystemModule