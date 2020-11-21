const Module = require("../../lib/Module.js")
const Configuration = require("./Configuration.js")
const EmojiManager = require("./EmojiManager.js")
const RoleManager = require("./RoleManager.js")
const ReactionManager = require("./ReactionManager.js")
const RoleEmbed = require("./RoleEmbed.js")

class RoleManagerModule extends Module {
    static async fromConfig(client, config) {
        const channel = await client.channels.fetch(config.channelId)
        const roleMessage = await channel.messages.fetch(config.roleMessageId)

        return new RoleManagerModule(client, new Configuration({ channel, roleMessage }))
    }

    static async fromMessage(message, args) {
        if (!args[0]) {
            await message.channel.send("Keine Textkanal angegeben")
            return
        }

        const channel = await message.guild.channels.cache.get(args[0])

        if (!channel) {
            await message.channel.send("Der Textkanal existiert nicht")
            return
        }

        const config = new Configuration({ channel })
        return new RoleManagerModule(message.client, config)
    }

    constructor(client, config) {
        super()

        this.client = client
        this.config = config
        this.emojiManager = new EmojiManager(this.config.channel.guild)
        this.roleManager = new RoleManager(this.config.channel.guild)
        this.reactionManager = new ReactionManager(this.client, this.emojiManager, this.roleManager, this.config.roleMessage)
    }

    async start() {
        if (!this.config.roleMessage) {
            this.config.roleMessage = await this.config.channel.send(new RoleEmbed())
            this.reactionManager.setMessage(this.config.roleMessage)
        }

        await this.emojiManager.init()
        await this.roleManager.init()
        await this.reactionManager.init()
    }

    async stop() {
        await this.config.roleMessage.delete()
        
        await this.emojiManager.delete()
        await this.roleManager.delete()
        await this.reactionManager.delete()
    }

    getConfig() {
        return this.config
    }
}

RoleManagerModule.meta = {
    description: "Erstellt eine Nachricht, über dessen Reaktionen die Skill-Rollen vergeben werden.",
    arguments: "<textkanal_id>",
    features: [
        "Erstellt die Skill-Rollen sowie jeweils ein Emoji für jede Rolle,",
        "Sendet eine Nachricht in den angegebenen Textkanal, die jeweils eine Reaktion zur Vergebung der Rollen besitzt."
    ]
}

module.exports = RoleManagerModule