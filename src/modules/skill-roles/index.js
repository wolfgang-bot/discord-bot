const LocaleServiceProvider = require("../../services/LocaleServiceProvider.js")
const Configuration = require("./models/Configuration.js")
const EmojiManager = require("./managers/EmojiManager.js")
const RoleManager = require("./managers/RoleManager.js")
const ReactionManager = require("./managers/ReactionManager.js")
const RoleEmbed = require("./embeds/RoleEmbed.js")
const Guild = require("../../models/Guild.js")

class RoleManagerModule {
    static makeConfigFromArgs = Configuration.fromArgs
    static makeConfigFromJSON = Configuration.fromJSON

    constructor(context, config) {
        this.context = context
        this.config = config
        
        this.emojiManager = new EmojiManager(this.context)
        this.roleManager = new RoleManager(this.context)
        this.reactionManager = new ReactionManager(this.context, this.config.roleMessage, this.emojiManager, this.roleManager)
    }

    async start() {
        if (!this.config.roleMessage) {
            const guildConfig = await Guild.config(this.context.guild)
            const locale = (await LocaleServiceProvider.guild(this.context.guild)).scope("skill-roles")

            this.config.roleMessage = await this.config.channel.send(new RoleEmbed(guildConfig, locale))
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

module.exports = RoleManagerModule