const Guild = require("../../Models/Guild.js")

class RoleManagaer {
    constructor(guild) {
        this.guild = guild
        this.config = null

        this.roles = {}
    }

    getRoles() {
        return this.roles
    }

    async createRoles() {
        await Promise.all(this.config.skillRoles.roles.map(async name => {
            let role = this.guild.roles.cache.find(role => role.name === name)

            if (!role) {
                role = await this.guild.roles.create({
                    data: {
                        name,
                        color: this.config.skillRoles.roleColor
                    }
                })
            }

            this.roles[name] = role
        }))
    }
    
    async deleteRoles() {
        await Promise.all(this.config.skillRoles.roles.map(name => {
            const role = this.guild.roles.cache.find(role => role.name === name)

            if (role) {
                return role.delete()
            }
        }))
    }

    async init() {
        this.config = await Guild.config(this.guild)

        await this.createRoles()
    }

    async delete() {
        await this.deleteRoles()
    }
}

module.exports = RoleManagaer