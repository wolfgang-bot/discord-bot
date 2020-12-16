class ReactionManager {
    constructor(context, message, emojiManager, roleManager) {
        this.context = context
        this.message = message
        this.emojiManager = emojiManager
        this.roleManager = roleManager

        this.reactions = {}

        this.handleReactionAdd = this.handleReactionAdd.bind(this)
        this.handleReactionRemove = this.handleReactionRemove.bind(this)
    }

    setMessage(message) {
        this.message = message
    }

    async createReactions() {
        const roles = Object.keys(this.roleManager.getRoles())

        await Promise.all(roles.map(async roleName => {
            const emojiName = this.emojiManager.makeEmojiName(roleName)

            let reaction = this.message.reactions.cache.find(reaction => reaction.emoji.name === emojiName)

            if (!reaction) {
                const emoji = this.emojiManager.getEmojis()[roleName]

                if (!emoji) {
                    console.error(`Emoji for role '${roleName}' is not available`)
                    return
                }

                reaction = await this.message.react(emoji)
            }

            this.reactions[roleName] = reaction
        }))
    }

    async handleReactionAdd(reaction, user) {
        if (user.bot || reaction.message.guild.id !== this.context.guild.id) {
            return
        }

        if (reaction.message.id === this.message.id) {
            const member = await this.context.guild.members.fetch(user)
            
            const roleName = this.emojiManager.getRoleFromEmoji(reaction.emoji)
            const role = this.roleManager.getRoles()[roleName]

            await member.roles.add(role)
        }
    }

    async handleReactionRemove(reaction, user) {
        if (user.bot || reaction.message.guild.id !== this.context.guild.id) {
            return
        }

        if (reaction.message.id === this.message.id) {
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

module.exports = ReactionManager