const LocaleServiceProvider = require("../../services/LocaleServiceProvider.js")
const Configuration = require("./models/Configuration.js")
const EmojiManager = require("./managers/EmojiManager.js")
const RoleManager = require("./managers/RoleManager.js")
const ReactionManager = require("./managers/ReactionManager.js")
const RoleEmbed = require("./embeds/RoleEmbed.js")
const Guild = require("../../models/Guild.js")

class RoleManagerModule {
    static async fromConfig(client, module, guild, config) {
        const channel = await guild.channels.cache.get(config.channelId)
        const roleMessage = await channel.messages.fetch(config.roleMessageId)

        return new RoleManagerModule(client, module, guild, new Configuration({ channel, roleMessage }))
    }

    static async fromArguments(client, module, guild, args) {
        const locale = await LocaleServiceProvider.guild(guild)
        const moduleLocale = locale.scope("skill-roles")

        if (!args[0]) {
            throw locale.translate("error_missing_argument", moduleLocale.translate("arg_roles_channel_name"))
        }

        const channel = await guild.channels.cache.get(args[0])

        if (!channel) {
            throw moduleLocale.translate("error_textchannel_does_not_exist")
        }

        const config = new Configuration({ channel })
        return new RoleManagerModule(client, module, guild, config)
    }

    constructor(client, module, guild, config) {
        this.client = client
        this.module = module
        this.guild = guild
        this.config = config
        
        this.emojiManager = new EmojiManager(this.guild)
        this.roleManager = new RoleManager(this.guild)
        this.reactionManager = new ReactionManager(this.client, this.guild, this.emojiManager, this.roleManager, this.config.roleMessage)
    }

    async start() {
        if (!this.config.roleMessage) {
            const guildConfig = await Guild.config(this.guild)
            const locale = (await LocaleServiceProvider.guild(this.guild)).scope("skill-roles")

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