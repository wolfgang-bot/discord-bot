import Discord from "discord.js"
import User from "../models/User"
import Guild from "../models/Guild"

export abstract class Validator {
    abstract run(client: Discord.Client, input: object): Promise<object>

    constructor(protected error: any) {}
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
                Object.assign(args, await validator.run(this.client, args))
            } catch (error) {
                return error
            }
        }
    }

    bind(fn: Function, getArgs: (...args: any[]) => object) {
        return async (...args: any[]) => {
            let error = await this.validate(getArgs(...args))
            fn(error, ...args)
        }
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

        return { guild }
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

        return { guild, user }
    }
}
