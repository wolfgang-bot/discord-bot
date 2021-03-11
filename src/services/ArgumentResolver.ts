import Discord from "discord.js"
import log from "loglevel"
import Argument, { TYPES } from "../lib/Argument"
import LocaleProvider from "./LocaleProvider"

export type ArgumentResolveTypes =
    string |
    number |
    boolean |
    Discord.TextChannel |
    Discord.VoiceChannel |
    Discord.CategoryChannel |
    Discord.Role |
    ArgumentResolveTypes[]

class ArgumentResolver {
    guild: Discord.Guild
    resolverMap: Record<TYPES, (raw: any) => Promise<ArgumentResolveTypes>> = {
        [TYPES.STRING]: this.resolveString,
        [TYPES.NUMBER]: this.resolveNumber,
        [TYPES.BOOLEAN]: this.resolveBoolean,
        [TYPES.TEXT_CHANNEL]: this.resolveTextChannel,
        [TYPES.VOICE_CHANNEL]: this.resolveVoiceChannel,
        [TYPES.CATEGORY_CHANNEL]: this.resolveCategoryChannel,
        [TYPES.ROLE]: this.resolveRole
    }

    /**
     * Create an ArgumentResolver instance bound to a guild
     */
    static guild(guild: Discord.Guild) {
        return new ArgumentResolver(guild)
    }

    constructor(guild: Discord.Guild) {
        this.guild = guild
    }

    isValidEntity(entity: any) {
        return (
            entity !== undefined &&
            entity !== null &&
            !Number.isNaN(entity)
        )
    }

    /**
     * Convert a text based argument (e.g. an id) to the corresponding object
     */
    async resolveArgument(argument: Argument, raw: any | any[]): Promise<ArgumentResolveTypes> {
        try {
            if (Array.isArray(raw)) {
                if (!argument.isArray) {
                    throw "Argument is not an array"
                }

                if (raw.length === 0) {
                    throw "Arguments of type array cannot be empty"
                }

                return await this.resolveArray(argument, raw)
            }

            const res = argument.isSelect ?
                await this.resolveSelect(argument, raw) :
                await this.resolveSingle(argument, raw)

            if (!this.isValidEntity(res)) {
                throw "Entity does not exist"
            }

            return res
        } catch (error) {
            log.debug(error)

            const locale = await LocaleProvider.guild(this.guild)

            throw locale.translate(
                "error_does_not_exist",
                Array.isArray(raw) ? raw.join(", ") : raw
            )
        }
    }

    /**
     * Resolve an array of values
     */
    async resolveArray(argument: Argument, raw: string[]) {
        return await Promise.all(raw.map(async value => (
            await this.resolveArgument(argument, value)
        )))
    }

    /**
     * Resolve an argument tagged as select
     */
    async resolveSelect(argument: Argument, raw: string) {
        if (!argument.selectOptions.includes(raw)) {
            return
        }

        return this.resolveSingle(argument, raw)
    }

    /**
     * Resolve a single value
     */
    async resolveSingle(argument: Argument, raw: any): Promise<ArgumentResolveTypes> {
        const resolver = this.resolverMap[argument.type]

        if (!resolver) {
            throw new Error(`The type '${argument.type}' does not exist`)
        }

        return await resolver.call(this, raw)
    }

    async resolveString(raw: any) {
        if (typeof raw !== "string") {
            return
        }

        return raw
    }

    async resolveNumber(raw: any) {
        if (typeof raw === "string") {
            return parseInt(raw)
        }

        if (typeof raw === "number") {
            return raw
        }
    }

    async resolveBoolean(raw: any) {
        if (typeof raw === "boolean") {
            return raw
        }
    }

    /**
     * Fetch a text channel by id
     */
    async resolveTextChannel(id: string) {
        const channel = this.guild.channels.cache.get(id)

        if (!channel || channel.type !== "text") {
            return
        }

        return channel as Discord.TextChannel
    }
    
    /**
     * Fetch a voice channel by id
     */
    async resolveVoiceChannel(id: string) {
        const channel = this.guild.channels.cache.get(id)

        if (!channel || channel.type !== "voice") {
            return
        }

        return channel as Discord.VoiceChannel
    }

    /**
     * Fetch a category channel by id
     */
    async resolveCategoryChannel(id: string) {
        const channel = this.guild.channels.cache.get(id)

        if (!channel || channel.type !== "category") {
            return
        }

        return channel as Discord.CategoryChannel
    }

    /**
     * Fetch a role by id
     */
    async resolveRole(id: string) {
        const role = this.guild.roles.cache.get(id)

        return role ? role : undefined
    }
}

export default ArgumentResolver
