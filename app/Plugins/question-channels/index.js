const Plugin = require("../../lib/Plugin.js")
const Configuration = require("./Configuration.js")

class QuestionChannelsPlugin extends Plugin {
    client = null
    config = null

    static async fromConfig(client, config) {
        const channel = await client.channels.fetch(config.channelId)
        return new QuestionChannelsPlugin(client, new Configuration({ channel }))
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
    }

    init() {
        this.client.on("message", this.handleMessage.bind(this))
    }

    async handleMessage(message) {
        if (message.channel.id === this.config.channel.id && message.author.id !== this.client.user.id) {
            await message.channel.send(message.content)
        }
    }

    getConfig() {
        return this.config
    }
}

module.exports = QuestionChannelsPlugin