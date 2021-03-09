import Discord from "discord.js"
import User from "../models/User"
import Guild from "../models/Guild"
import Module from "../models/Module"
import ModuleInstance from "../models/ModuleInstance"

export type ValidationError = object | void

export abstract class Validator {
    constructor(public error: ValidationError) {}
    
    abstract run(client: Discord.Client, input: object): Promise<object | void>
}

export class ValidationPipeline {
    constructor(
        private client: Discord.Client,
        private validators: Validator[]
    ) { }

    async validate(input: object): Promise<any> {
        const args = { ...input }

        for (let validator of this.validators) {
            try {
                const result = await validator.run(this.client, args)
                Object.assign(args, result || {})
            } catch (error) {
                if (process.env.NODE_ENV === "development") {
                    console.log(error)
                }
                
                return validator.error
            }
        }
    }

    bind(fn: Function, getArgs: (...args: any[]) => object) {
        return async (...args: any[]) => {
            let error = await this.validate(getArgs(...args))
            fn(error, ...args)
        }
    }

    clone() {
        return new ValidationPipeline(this.client, [...this.validators])
    }

    extend(validators: Validator[]) {
        const clonedPipeline = this.clone()
        clonedPipeline.validators.push(...validators)
        return clonedPipeline
    }
}

export class GuildExistsValidator extends Validator {
    async run(client: Discord.Client, { guildId }: { guildId: string }) {
        const guild = await Guild.findBy("id", guildId) as Guild

        if (!guild) {
            throw this.error
        }

        return { guild }
    }
}

export class GuildAvailableValidator extends Validator {
    async run(client: Discord.Client, { guild }: { guild: Guild }) {
        await guild.fetchDiscordGuild(client)

        if (!guild.discordGuild.available) {
            throw this.error
        }
    }
}

export class GuildAdminValidator extends Validator {
    async run(client: Discord.Client, { guild, user }: {
        guild: Guild,
        user: User
    }) {
        if (!await user.isAdmin(guild)) {
            throw this.error
        }
    }
}

export class ModuleExistsValidator extends Validator {
    async run(client: Discord.Client, { moduleKey }: { moduleKey: string }) {
        const module = await Module.findBy("key", moduleKey)

        if (!module) {
            throw this.error
        }

        return { module }
    }
}

export class ModuleInstanceExistsValidator extends Validator {
    async run(client: Discord.Client, { guild, moduleKey }) {
        const instance = await ModuleInstance.findByGuildAndModuleKey(guild, moduleKey)

        if (!instance) {
            throw this.error
        }

        return { instance }
    }
}
