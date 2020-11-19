const Module = require("../../lib/Module.js")
const Configuration = require("./Configuration.js")
const ReputationManager = require("./ReputationManager.js")

class ReputationSystemModule extends Module {
    static async fromConfig(client, config) {
        const guild = await client.guilds.fetch(config.guildId)
        const channel = await client.channels.fetch(config.channelId)

        return new ReputationSystemModule(client, new Configuration({ guild, channel }))
    }

    static async fromMessage(message, args) {
        if (!args[0]) {
            await message.channel.send("Kein Textkanal angegeben")
            return
        }

        const channel = message.guild.channels.cache.get(args[0])

        if (!channel) {
            await message.channel.send("Der Textkanal existiert nicht")
            return
        }

        const config = new Configuration({ guild: message.guild, channel })
        return new ReputationSystemModule(message.client, config)
    }

    constructor(client, config) {
        super()

        this.client = client
        this.config = config
        this.reputationManager = new ReputationManager(this.client, this.config.guild, this.config.channel)
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

module.exports = ReputationSystemModule