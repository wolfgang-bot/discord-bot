import Discord from "discord.js"
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
    name: "Skill Roles",
    desc: "Creates a message with reaction-roles.",
    features: [
        "Creates the skill-roles and one emoji per role.",
        "Sends a messages into the roles channel which has one reaction per role used to assign it."
    ]
})
@argument({
    type: ARGUMENT_TYPES.TEXT_CHANNEL,
    key: "channel",
    name: "Roles Channel",
    desc: "The channel in which the reaction-roles message will be sent.",
})
@argument({
    type: ARGUMENT_TYPES.STRING,
    key: "emojiPrefix",
    defaultValue: "skill_",
    name: "Emoji Prefix",
    desc: "Prefix of the role names"
})
@argument({
    type: ARGUMENT_TYPES.STRING,
    key: "roleColor",
    defaultValue: "AQUA",
    name: "Role Color",
    desc: "Color of the roles"
})
@argument({
    type: ARGUMENT_TYPES.STRING,
    key: "roles",
    defaultValue: roles,
    isArray: true,
    isSelect: true,
    selectOptions: roles,
    name: "Roles",
    desc: "Names of the roles which will be created"
})
export default class RoleManagerModule extends Module {
    static config = Configuration

    config: Configuration
    emojiManager: EmojiManager
    roleManager: RoleManager
    reactionManager: ReactionManager
    roleMessage: Discord.Message
    
    async start() {
        await this.fetchRoleMessage()

        this.emojiManager = new EmojiManager(this.context, this.config)
        this.roleManager = new RoleManager(this.context, this.config)
        this.reactionManager = new ReactionManager(this.context, this.config, {
            emojiManager: this.emojiManager,
            roleManager: this.roleManager,
            roleMessage: this.roleMessage
        })

        await Promise.all([
            this.emojiManager.init(),
            this.roleManager.init()
        ])

        await this.reactionManager.init()
    }

    async stop() {
        const instance = await ModuleInstance.findByContext(this.context)

        delete instance.data.roleMessage
        
        await Promise.all([
            this.roleMessage.delete(),
            this.emojiManager.delete(),
            this.roleManager.delete(),
            this.reactionManager.delete(),
            instance.update()
        ])
    }

    async fetchRoleMessage() {
        const instance = await ModuleInstance.findByContext(this.context)
        
        if (!instance.data.roleMessage) {
            const settings = await ModuleInstance.config(this.context.guild, "settings") as SettingsConfig
            const locale = (await LocaleProvider.guild(this.context.guild)).scope("skill-roles")

            this.roleMessage = await this.config.channel.send(new RoleEmbed(settings, locale))
            instance.data.roleMessage = this.roleMessage.id
            await instance.update()
        } else {
            this.roleMessage = await this.config.channel.messages.fetch(instance.data.roleMessage)
        }
    }
}
