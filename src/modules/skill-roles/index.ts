import Module from "../../lib/Module"
import { module, argument } from "../../lib/decorators"
import { TYPES as ARGUMENT_TYPES } from "../../lib/Argument"
import LocaleProvider from "../../services/LocaleProvider"
import Configuration from "./models/Configuration"
import EmojiManager from "./managers/EmojiManager"
import RoleManager from "./managers/RoleManager"
import ReactionManager from "./managers/ReactionManager"
import RoleEmbed from "./embeds/RoleEmbed"
import ModuleInstance from "../../models/ModuleInstance"
import SettingsConfig from "../settings/models/Configuration"

const roles = [
    "Javascript",
    "Python",
    "React",
    "Vue",
    "Angular",
    "Linux",
    "Java",
    "Cpp"
]

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
@argument({
    type: ARGUMENT_TYPES.STRING,
    key: "emoji_prefix",
    defaultValue: "skill_",
    name: "arg_emoji_prefix_name",
    desc: "arg_emoji_prefix_desc"
})
@argument({
    type: ARGUMENT_TYPES.STRING,
    key: "role_color",
    defaultValue: "AQUA",
    name: "arg_role_color_name",
    desc: "arg_role_color_desc"
})
@argument({
    type: ARGUMENT_TYPES.STRING,
    key: "roles",
    defaultValue: roles,
    isArray: true,
    isSelect: true,
    selectOptions: roles,
    name: "arg_roles_name",
    desc: "arg_roles_desc"
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
            const settings = await ModuleInstance.config(this.context.guild, "settings") as SettingsConfig
            const locale = (await LocaleProvider.guild(this.context.guild)).scope("skill-roles")

            this.config.roleMessage = await this.config.channel.send(new RoleEmbed(settings, locale))
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
