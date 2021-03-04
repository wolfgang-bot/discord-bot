import Discord from "discord.js"
import Argument from "../lib/Argument"
import LocaleProvider from "./LocaleProvider"

export type ArgumentResolveTypes =
    string |
    number |
    Discord.TextChannel |
    Discord.VoiceChannel |
    Discord.CategoryChannel |
    Discord.Role

class ArgumentResolver {
    guild: Discord.Guild

    /**
     * Create an ArgumentResolver instance bound to a guild
     */
    static guild(guild: Discord.Guild) {
        return new ArgumentResolver(guild)
    }

    constructor(guild: Discord.Guild) {
        this.guild = guild
    }

    /**
     * Convert a text based argument (e.g. an id) to the corresponding object
     */
    async resolveArgument(argument: Argument, raw: string | string[]): Promise<ArgumentResolveTypes | ArgumentResolveTypes[]> {
        try {
            if (Array.isArray(raw)) {
                if (!argument.isArray) {
                    throw "Argument is not an array"
                }

                return await this.resolveArray(argument, raw)
            }

            const res = await this.resolveSingle(argument, raw)

            if (!res && res !== 0) {
                throw "Entity does not exist"
            }

            return res
        } catch (error) {
            if (process.env.NODE_ENV === "development") {
                console.log(error)
            }

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
    async resolveArray(argument: Argument, raw: string[]): Promise<ArgumentResolveTypes[]> {
        return await Promise.all(raw.map(async value => {
            const resolved = await this.resolveArgument(argument, value)

            if (Array.isArray(resolved)) {
                throw "Nested arrays are not supported"
            }

            return resolved
        }))
    }

    /**
     * Resolve a single value
     */
    async resolveSingle(argument: Argument, raw: string): Promise<ArgumentResolveTypes> {
        switch (argument.type) {
            case Argument.TYPES.STRING:
                return raw

            case Argument.TYPES.NUMBER:
                return parseInt(raw)

            case Argument.TYPES.TEXT_CHANNEL:
                return await this.fetchTextChannel(raw)

            case Argument.TYPES.VOICE_CHANNEL:
                return await this.fetchVoiceChannel(raw)

            case Argument.TYPES.CATEGORY_CHANNEL:
                return await this.fetchCategoryChannel(raw)

            case Argument.TYPES.ROLE:
                return await this.fetchRole(raw)

            default:
                throw new Error(`The type '${argument.type}' does not exist`)
        }
    }

    /**
     * Fetch a text channel by id
     */
    async fetchTextChannel(id: string) {
        const channel = this.guild.channels.cache.get(id)

        if (!channel || channel.type !== "text") {
            return
        }

        return channel as Discord.TextChannel
    }
    
    /**
     * Fetch a voice channel by id
     */
    async fetchVoiceChannel(id: string) {
        const channel = this.guild.channels.cache.get(id)

        if (!channel || channel.type !== "voice") {
            return
        }

        return channel as Discord.VoiceChannel
    }

    /**
     * Fetch a category channel by id
     */
    async fetchCategoryChannel(id: string) {
        const channel = this.guild.channels.cache.get(id)

        if (!channel || channel.type !== "category") {
            return
        }

        return channel as Discord.CategoryChannel
    }

    /**
     * Fetch a role by id
     */
    async fetchRole(id: string) {
        const role = this.guild.roles.cache.get(id)

        return role ? role : null
    }
}

export default ArgumentResolver
