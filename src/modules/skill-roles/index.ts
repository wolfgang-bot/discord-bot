import Module from "@personal-discord-bot/shared/dist/module/Module"
import { module, argument } from "@personal-discord-bot/shared/dist/module/decorators"
import { TYPES as ARGUMENT_TYPES } from "@personal-discord-bot/shared/dist/module/Argument"
import LocaleProvider from "@personal-discord-bot/shared/dist/LocaleProvider"
import Guild from "@personal-discord-bot/shared/dist/models/Guild"
import Configuration from "./models/Configuration"
import EmojiManager from "./managers/EmojiManager"
import RoleManager from "./managers/RoleManager"
import ReactionManager from "./managers/ReactionManager"
import RoleEmbed from "./embeds/RoleEmbed"

@module({
    key: "skill-roles",
    name: "meta_name",
    desc: "meta_desc",
    features: "meta_features"
})
@argument({
    type: ARGUMENT_TYPES.TEXT_CHANNEL,
    key: "roles_channel_id",
    name: "arg_roles_channel_display_name",
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
            const locale = (await LocaleProvider.guild(this.context.guild)).scope("skill-roles")

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
