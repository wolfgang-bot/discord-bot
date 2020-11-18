const Plugin = require("../../lib/Plugin.js")
const Configuration = require("./Configuration.js")
const ChannelManager = require("./ChannelManager.js")
const HelpEmbed = require("./HelpEmbed.js")

class QuestionChannelsPlugin extends Plugin {
    client = null
    config = null

    static async fromConfig(client, config) {
        const channel = await client.channels.fetch(config.channelId)
        const helpMessage = await channel.messages.fetch(config.helpMessageId)
        return new QuestionChannelsPlugin(client, new Configuration({ channel, helpMessage }))
    }

    static async fromMessage(message, args) {
        if (!args[0]) {
            await message.channel.send("Kein Textkanal angegeben")
            return null
        }

        const channel = message.guild.channels.cache.get(args[0])

        if (!channel) {
            await message.channel.send("Der Textkanal existiert nicht")
            return null
        }

        const config = new Configuration({ channel })

        return new QuestionChannelsPlugin(message.client, config)
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

        this.channelManager.init()
    }

    async stop() {
        await this.config.helpMessage.delete()
        this.channelManager.delete()
    }

    getConfig() {
        return this.config
    }
}

module.exports = QuestionChannelsPlugin