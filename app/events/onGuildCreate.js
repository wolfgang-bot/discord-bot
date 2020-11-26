const Guild = require("../Models/Guild.js")
const User = require("../Models/User.js")
const Member = require("../Models/Member.js")

async function run(client, guild) {
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

module.exports = run