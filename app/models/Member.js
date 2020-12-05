const { v4: uuid } = require("uuid")
const Model = require("../lib/Model.js")

class Member extends Model {
    constructor(values) {
        super({
            table: "members",
            columns: ["id", "user_id", "guild_id", "reputation"],
            defaultValues: {
                id: uuid,
                reputation: 0
            },
            ...values
        })

        this.user = null
        this.guild = null
        this.discordUser = null
    }

    async fetchUser() {
        this.user = await User.findBy("id", this.user_id)
    }
    
    async fetchGuild() {
        this.guild = await Guild.findBy("id", this.guild_id)
    }
    
    async fetchDiscordUser(client) {
        this.discordUser = await client.users.fetch(this.user_id)
    }
}

Model.bind(Member, "members")

module.exports = Member

const User = require("./User.js")
const Guild = require("./Guild.js")