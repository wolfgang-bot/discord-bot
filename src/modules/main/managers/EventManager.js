const CommandRegistry = require("../../../services/CommandRegistry.js")
const Guild = require("../../../models/Guild.js")
const User = require("../../../models/User.js")
const Member = require("../../../models/Member.js")

class EventManager {
    constructor({ client }) {
        this.client = client
    }

    /**
     * "message" event handler.
     * 
     * @param {Discord.Message} message
     */
    async handleMessage(message) {
        // Execute the requested command via the root command registry
        if (!message.author.bot && message.content.startsWith(process.env.DISCORD_BOT_PREFIX)) {
            try {
                await CommandRegistry.root.run(message)
            } catch (error) {
                if (process.env.NODE_ENV === "development") {
                    console.error(error)
                }

                await message.channel.send(typeof error === "string" ? error : "Serverfehler")
            }
        }
    }

    /**
     * "guildCreate" event handler.
     * 
     * @param {Discord.Guild} guild
     */
    async handleGuildCreate(guild) {
        // Store the guild in the database
        const model = new Guild({ id: guild.id })
        await model.store()

        await guild.members.fetch()

        // Store all members / users of the guild in the database
        await Promise.all(guild.members.cache.map(async member => {
            if (member.user.bot) {
                return
            }

            let user = await User.findBy("id", member.user.id)

            if (!user) {
                user = new User({ id: member.user.id })
                await user.store()
            }

            const model = new Member({
                user_id: user.id,
                guild_id: guild.id
            })
            await model.store()
        }))
    }

    /**
     * "guildDelete" event handler.
     * 
     * @param {Discord.Guild} guild
     */
    async handleGuildDelete(guild) {
        const model = await Guild.findBy("id", guild.id)

        if (model) {
            await model.delete()
        }
    }

    /**
     * "guildMemberAdd" event handler.
     * 
     * @param {Discord.Member} member
     */
    async handleGuildMemberAdd(member) {
        if (member.user.bot) {
            return
        }

        // Fetch the user role
        const config = await Guild.config(member.guild)
        const roles = await member.guild.roles.fetch()
        const userRole = roles.cache.find(role => role.name === config.userRole)

        // Assign the user role to the new user
        if (!userRole) {
            console.error(`The role '${config.userRole}' does not exist`)
        } else {
            await member.roles.add(userRole)
        }

        // Create user if not exists
        let user = await User.findBy("id", member.user.id)
        if (!user) {
            user = new User({ id: member.user.id })
            await user.store()
        }

        // Create member for user
        const model = new Member({
            user_id: member.user.id,
            guild_id: member.guild.id
        })
        await model.store()
    }

    /**
     * "guildMemberRemove" event handler.
     * 
     * @param {Discord.Member} member
     */
    async handleGuildMemberRemove(member) {
        if (member.user.bot) {
            return
        }

        // Delete member from database
        const model = await Member.where(`user_id = '${member.user.id}' AND guild_id = '${member.guild.id}'`)
        if (model) {
            await model.delete()
        }

        // Delete user from database if he has no members anymore
        const members = await Member.findAllBy("user_id", member.user.id)
        if (members.length === 0) {
            await model.fetchUser()
            await model.user.delete()
        }
    } 

    init() {
        this.client.on("message", this.handleMessage.bind(this))
        this.client.on("guildCreate", this.handleGuildCreate.bind(this))
        this.client.on("guildDelete", this.handleGuildDelete.bind(this))
        this.client.on("guildMemberAdd", this.handleGuildMemberAdd.bind(this))
        this.client.on("guildMemberRemove", this.handleGuildMemberRemove.bind(this))
    }
}

module.exports = EventManager