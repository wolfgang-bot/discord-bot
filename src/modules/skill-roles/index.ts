import Module from "../../lib/Module"
import LocaleServiceProvider from "../../services/LocaleServiceProvider"
import Guild from "../../models/Guild"
import Configuration from "./models/Configuration"
import EmojiManager from "./managers/EmojiManager"
import RoleManager from "./managers/RoleManager"
import ReactionManager from "./managers/ReactionManager"
import RoleEmbed from "./embeds/RoleEmbed"
import Context from "../../lib/Context"

export default class RoleManagerModule extends Module {
    static makeConfigFromArgs = Configuration.fromArgs
    static makeConfigFromJSON = Configuration.fromJSON

    config: Configuration
    emojiManager: EmojiManager
    roleManager: RoleManager
    reactionManager: ReactionManager

    constructor(context: Context, config: Configuration) {
        super(context)
        this.config = config
    }
    
    async start() {
        this.emojiManager = new EmojiManager(this.context)
        this.roleManager = new RoleManager(this.context)
        this.reactionManager = new ReactionManager(this.context, this.config, this.emojiManager, this.roleManager)

        if (!this.config.roleMessage) {
            const guildConfig = await Guild.config(this.context.guild)
            const locale = (await LocaleServiceProvider.guild(this.context.guild)).scope("skill-roles")

            this.config.roleMessage = await this.config.channel.send(new RoleEmbed(guildConfig, locale))
            this.reactionManager.setMessage(this.config.roleMessage)
        }

        await Promise.all([
            this.emojiManager.init(),
            this.roleManager.init()
        ])

        await this.reactionManager.init()
    }

    async stop() {
        await Promise.all([
            this.config.roleMessage.delete(),
            this.emojiManager.delete(),
            this.roleManager.delete(),
            this.reactionManager.delete()
        ])
        
        delete this.config.roleMessage
    }

    getConfig() {
        return this.config
    }
}