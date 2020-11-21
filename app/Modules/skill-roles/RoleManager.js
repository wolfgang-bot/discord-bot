const config = require("../../../config")

class RoleManagaer {
    constructor(guild) {
        this.guild = guild

        this.roles = {}
    }

    getRoles() {
        return this.roles
    }

    async createRoles() {
        await Promise.all(config.skillRoles.roles.map(async name => {
            let role = this.guild.roles.cache.find(role => role.name === name)

            if (!role) {
                role = await this.guild.roles.create({
                    data: {
                        name,
                        color: config.skillRoles.roleColor
                    }
                })
            }

            this.roles[name] = role
        }))
    }
    
    async deleteRoles() {
        await Promise.all(config.skillRoles.roles.map(name => {
            const role = this.guild.roles.cache.find(role => role.name === name)

            if (role) {
                return role.delete()
            }
        }))
    }

    async init() {
        await this.createRoles()
    }

    async delete() {
        await this.deleteRoles()
    }
}

module.exports = RoleManagaer