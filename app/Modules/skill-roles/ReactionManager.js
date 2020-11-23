class ReactionManager {
    constructor(client, guild, emojiManager, roleManager, message) {
        this.client = client
        this.guild = guild
        this.emojiManager = emojiManager
        this.roleManager = roleManager
        this.message = message

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
        if (reaction.message.guild.id !== this.guild.id) {
            return
        }

        if (reaction.message.id === this.message.id) {
            const member = await this.guild.members.fetch(user)
            
            const roleName = this.emojiManager.getRoleFromEmoji(reaction.emoji)
            const role = this.roleManager.getRoles()[roleName]

            await member.roles.add(role)
        }
    }

    async handleReactionRemove(reaction, user) {
        if (reaction.message.guild.id !== this.guild.id) {
            return
        }

        if (reaction.message.id === this.message.id) {
            const member = await this.guild.members.fetch(user)

            const roleName = this.emojiManager.getRoleFromEmoji(reaction.emoji)
            const role = this.roleManager.getRoles()[roleName]

            await member.roles.remove(role)
        }
    }

    async init() {
        await this.createReactions()

        this.client.on("messageReactionAdd", this.handleReactionAdd)
        this.client.on("messageReactionRemove", this.handleReactionRemove)
    }

    async delete() {
        this.client.removeListener("messageReactionAdd", this.handleReactionAdd)
        this.client.removeListener("messageReactionRemove", this.handleReactionRemove)
    }
}

module.exports = ReactionManager