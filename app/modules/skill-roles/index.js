const Module = require("../../lib/Module.js")
const Configuration = require("./Configuration.js")
const EmojiManager = require("./managers/EmojiManager.js")
const RoleManager = require("./managers/RoleManager.js")
const ReactionManager = require("./managers/ReactionManager.js")
const RoleEmbed = require("./embeds/RoleEmbed.js")
const Guild = require("../../models/Guild.js")

class RoleManagerModule extends Module {
    static async fromConfig(client, guild, config) {
        const channel = await guild.channels.cache.get(config.channelId)
        const roleMessage = await channel.messages.fetch(config.roleMessageId)

        return new RoleManagerModule(client, guild, new Configuration({ channel, roleMessage }))
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
        return new RoleManagerModule(client, guild, config)
    }

    constructor(client, guild, config) {
        super()

        this.client = client
        this.guild = guild
        this.config = config
        
        this.emojiManager = new EmojiManager(this.guild)
        this.roleManager = new RoleManager(this.guild)
        this.reactionManager = new ReactionManager(this.client, this.guild, this.emojiManager, this.roleManager, this.config.roleMessage)
    }

    async start() {
        if (!this.config.roleMessage) {
            const guildConfig = await Guild.config(this.guild)
            this.config.roleMessage = await this.config.channel.send(new RoleEmbed(guildConfig))
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
        "Erstellt die Skill-Rollen sowie jeweils ein Emoji für jede Rolle.",
        "Sendet eine Nachricht in den angegebenen Textkanal, die jeweils eine Reaktion zur Vergebung der Rollen besitzt."
    ]
}

module.exports = RoleManagerModule