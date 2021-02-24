import Discord from "discord.js"
import { Manager } from "@personal-discord-bot/shared/dist/module"
import { Guild } from "@personal-discord-bot/shared/dist/models"
import Configuration from "../models/Configuration"

type RoleMap = {
    [roleName: string]: Discord.Role
}

export default class RoleManagaer extends Manager {
    config: Configuration
    roles: RoleMap = {}
    
    getRoles() {
        return this.roles
    }

    async createRoles() {
        await Promise.all(this.config.roles.map(async name => {
            let role = this.context.guild.roles.cache.find(role => role.name === name)

            if (!role) {
                role = await this.context.guild.roles.create({
                    data: {
                        name,
                        color: this.config.roleColor
                    }
                })
            }

            this.roles[name] = role
        }))
    }
    
    async deleteRoles() {
        await Promise.all(this.config.roles.map(name => {
            const role = this.context.guild.roles.cache.find(role => role.name === name)

            if (role) {
                return role.delete()
            }
        }))
    }

    async init() {
        this.config = (await Guild.config(this.context.guild))["skill-roles"]

        await this.createRoles()
    }

    async delete() {
        await this.deleteRoles()
    }
}
