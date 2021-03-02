import Discord from "discord.js"
import Argument from "../lib/Argument"
import LocaleProvider from "./LocaleProvider"

export type ArgumentResolveTypes = Discord.TextChannel | Discord.VoiceChannel | Discord.CategoryChannel

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
    async resolveArgument(argument: Argument, raw: string): Promise<ArgumentResolveTypes> {
        try {
            let res: any

            switch (argument.type) {
                case Argument.TYPES.STRING:
                    res = raw
                    break

                case Argument.TYPES.NUMBER:
                    res = parseInt(raw)
                    break
                
                case Argument.TYPES.TEXT_CHANNEL:
                    res = await this.fetchTextChannel(raw)
                    break
    
                case Argument.TYPES.VOICE_CHANNEL:
                    res = await this.fetchVoiceChannel(raw)
                    break
    
                case Argument.TYPES.CATEGORY_CHANNEL:
                    res = await this.fetchCategoryChannel(raw)
                    break
    
                case Argument.TYPES.ROLE:
                    res = await this.fetchRole(raw)
                    break
    
                default:
                    throw new Error(`The type '${argument.type}' does not exist`)
            }

            if (!res && res !== 0) {
                throw new Error("Entity does not exist")
            }

            return res
        } catch (error) {
            if (process.env.NODE_ENV === "development") {
                console.log(error)
            }

            const locale = await LocaleProvider.guild(this.guild)
            throw locale.translate("error_does_not_exist", raw)
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
