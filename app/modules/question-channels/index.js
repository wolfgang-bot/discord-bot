const Module = require("../../lib/Module.js")
const Configuration = require("./Configuration.js")
const ChannelManager = require("./managers/ChannelManager.js")
const HelpEmbed = require("./embeds/HelpEmbed.js")
const Guild = require("../../models/Guild.js")

class QuestionChannelsModule extends Module {
    static async fromConfig(client, guild, config) {
        const channel = await guild.channels.cache.get(config.channelId)
        const helpMessage = await channel.messages.fetch(config.helpMessageId)
        return new QuestionChannelsModule(client, guild, new Configuration({ channel, helpMessage }))
    }

    static async fromArguments(client, guild, args) {
        if (!args[0]) {
            throw "Kein Textkanal angegeben"
        }

        const channel = await guild.channels.cache.get(args[0])

        if (!channel) {
            throw "Der Textkanal existiert nicht"
        }

        const config = new Configuration({ channel })

        return new QuestionChannelsModule(client, guild, config)
    }

    constructor(client, guild, config) {
        super()

        this.client = client
        this.guild = guild
        this.config = config

        this.channelManager = new ChannelManager(this.client, this.guild, this.config.channel)
    }

    async start() {
        const guildConfig = await Guild.config(this.guild)
        const moduleConfig = guildConfig["question-channels"]

        // Send help embed into channel if hasn't already
        if (!this.config.helpMessage) {
            this.config.helpMessage = await this.config.channel.send(new HelpEmbed(guildConfig))
        }

        await this.config.channel.setRateLimitPerUser(moduleConfig.askChannelRateLimit)

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