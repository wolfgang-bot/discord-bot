import Discord from "discord.js"
import log from "loglevel"
import Context from "../../../lib/Context"
import Manager from "../../../lib/Manager"
import Configuration from "../models/Configuration"
import EmojiManager from "./EmojiManager"
import RoleManager from "./RoleManager"

type ReactionMap = {
    [roleName: string]: Discord.MessageReaction
}

export default class ReactionManager extends Manager {
    config: Configuration
    emojiManager: EmojiManager
    roleManager: RoleManager
    roleMessage: Discord.Message
    reactions: ReactionMap

    constructor(context: Context, config: Configuration, { emojiManager, roleManager, roleMessage }: {
        emojiManager: EmojiManager,
        roleManager: RoleManager,
        roleMessage: Discord.Message
    }) {
        super(context)
        this.config = config
        this.emojiManager = emojiManager
        this.roleManager = roleManager
        this.roleMessage = roleMessage

        this.reactions = {}

        this.handleReactionAdd = this.handleReactionAdd.bind(this)
        this.handleReactionRemove = this.handleReactionRemove.bind(this)
    }

    async createReactions() {
        const roles = Object.keys(this.roleManager.getRoles())

        await Promise.all(roles.map(async roleName => {
            const emojiName = this.emojiManager.makeEmojiName(roleName)

            let reaction = this.roleMessage.reactions.cache.find(
                reaction => reaction.emoji.name === emojiName
            )

            if (!reaction) {
                const emoji = this.emojiManager.getEmojis()[roleName]

                if (!emoji) {
                    log.error(`Emoji for role '${roleName}' is not available`)
                    return
                }

                reaction = await this.roleMessage.react(emoji)
            }

            this.reactions[roleName] = reaction
        }))
    }

    async handleReactionAdd(reaction: Discord.MessageReaction, user: Discord.User) {
        if (user.bot || reaction.message.guild.id !== this.context.guild.id) {
            return
        }

        if (reaction.message.id === this.roleMessage.id) {
            const member = await this.context.guild.members.fetch(user)
            
            const roleName = this.emojiManager.getRoleFromEmoji(reaction.emoji)
            const role = this.roleManager.getRoles()[roleName]

            await member.roles.add(role)
        }
    }

    async handleReactionRemove(reaction: Discord.MessageReaction, user: Discord.User) {
        if (user.bot || reaction.message.guild.id !== this.context.guild.id) {
            return
        }

        if (reaction.message.id === this.roleMessage.id) {
            const member = await this.context.guild.members.fetch(user)

            const roleName = this.emojiManager.getRoleFromEmoji(reaction.emoji)
            const role = this.roleManager.getRoles()[roleName]

            await member.roles.remove(role)
        }
    }

    async init() {
        await this.createReactions()

        this.context.client.on("messageReactionAdd", this.handleReactionAdd)
        this.context.client.on("messageReactionRemove", this.handleReactionRemove)
    }

    async delete() {
        this.context.client.removeListener("messageReactionAdd", this.handleReactionAdd)
        this.context.client.removeListener("messageReactionRemove", this.handleReactionRemove)
    }
}
