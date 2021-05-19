import Discord from "discord.js"
import log from "loglevel"
import User from "../models/User"
import Guild from "../models/Guild"
import Module from "../models/Module"
import ModuleInstance from "../models/ModuleInstance"

export type ValidationError = object | void

export abstract class Validator {
    constructor(public error: ValidationError) {}
    
    abstract run(client: Discord.Client, input: object): Promise<object | void>

    protected assert(values: Record<string, any>) {
        for (let key in values) {
            if (values[key] === undefined || values[key] === null) {
                throw new Error(`Missing value for key: '${key}'`)
            }
        }
    }
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
                log.debug(error)
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
        this.assert({ guild })

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
        this.assert({ guild, user })

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
    async run(client: Discord.Client, { instanceId }: {
        instanceId: string
    }) {
        const instance = await ModuleInstance.findBy("id", instanceId)
        
        if (!instance) {
            throw this.error
        }

        return { instance }
    }
}

export class ModuleInstanceGuildAdminValidator extends Validator {
    async run(client: Discord.Client, { instance, user }: {
        instance: ModuleInstance,
        user: User
    }) {
        await instance.fetchGuild()
        await instance.guild.fetchDiscordGuild(client)

        if (!(await user.isAdmin(instance.guild.discordGuild))) {
            throw this.error
        }
    }
}
