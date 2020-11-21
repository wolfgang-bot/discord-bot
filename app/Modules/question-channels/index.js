const Module = require("../../lib/Module.js")
const Configuration = require("./Configuration.js")
const ChannelManager = require("./ChannelManager.js")
const HelpEmbed = require("./HelpEmbed.js")
const globalConfig = require("../../../config")

class QuestionChannelsModule extends Module {
    static async fromConfig(client, config) {
        const channel = await client.channels.fetch(config.channelId)
        const helpMessage = await channel.messages.fetch(config.helpMessageId)
        return new QuestionChannelsModule(client, new Configuration({ channel, helpMessage }))
    }

    static async fromMessage(message, args) {
        if (!args[0]) {
            await message.channel.send("Kein Textkanal angegeben")
            return
        }

        const channel = await message.guild.channels.cache.get(args[0])

        if (!channel) {
            await message.channel.send("Der Textkanal existiert nicht")
            return
        }

        const config = new Configuration({ channel })

        return new QuestionChannelsModule(message.client, config)
    }

    constructor(client, config) {
        super()

        this.client = client
        this.config = config
        this.channelManager = new ChannelManager(this.client, this.config.channel)
    }

    async start() {
        // Send help embed into channel if hasn't already
        if (!this.config.helpMessage) {
            this.config.helpMessage = await this.config.channel.send(new HelpEmbed())
        }

        await this.config.channel.setRateLimitPerUser(globalConfig.questionChannels.askChannelRateLimit)

        this.channelManager.init()
    }

    async stop() {
        await Promise.all([
            this.config.helpMessage.delete(),
            this.config.channel.setRateLimitPerUser(0)
        ])
        this.channelManager.delete()
    }

    getConfig() {
        return this.config
    }
}

QuestionChannelsModule.meta = {
    description: "Erstellt einen neuen Textkanal für jeden Benutzer, der eine Frage stellt.",
    arguments: "<fragenkanal_id>",
    features: [
        "Erstellt einen neuen Textkanal für einen Benutzer, wenn dieser eine Frage im Fragenkanal stellt.",
        "Löscht den Kanal wieder, wenn der Benutzer einen Nachricht als Antwort, oder die Frage als irrelevant markiert.",
        "Integriert das 'reputation-system' Modul."
    ]
}

module.exports = QuestionChannelsModule