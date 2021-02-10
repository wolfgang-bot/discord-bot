import Module from "../../lib/Module"
import { module, argument } from "../../lib/decorators"
import { TYPES as ARGUMENT_TYPES } from "../../lib/Argument"
import LocaleServiceProvider from "../../services/LocaleServiceProvider"
import Guild from "../../models/Guild"
import Configuration from "./models/Configuration"
import EmojiManager from "./managers/EmojiManager"
import RoleManager from "./managers/RoleManager"
import ReactionManager from "./managers/ReactionManager"
import RoleEmbed from "./embeds/RoleEmbed"

@module({
    name: "skill-roles",
    desc: "meta_desc",
    features: "meta_features"
})
@argument({
    type: ARGUMENT_TYPES.TEXT_CHANNEL,
    name: "arg_roles_channel_name",
    displayName: "arg_roles_channel_display_name",
    desc: "arg_roles_channel_desc",
})
export default class RoleManagerModule extends Module {
    static makeConfigFromArgs = Configuration.fromArgs
    static makeConfigFromJSON = Configuration.fromJSON

    config: Configuration
    emojiManager: EmojiManager
    roleManager: RoleManager
    reactionManager: ReactionManager
    
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