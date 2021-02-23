import Discord from "discord.js"
import Argument from "@personal-discord-bot/shared/dist/module/Argument"
import LocaleProvider from "@personal-discord-bot/shared/dist/LocaleProvider"

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
    resolveArgument(argument: Argument, raw: string): Promise<ArgumentResolveTypes> {
        switch (argument.type) {
            case Argument.TYPES.TEXT_CHANNEL:
                return this.fetchTextChannel(raw)

            case Argument.TYPES.VOICE_CHANNEL:
                return this.fetchVoiceChannel(raw)

            case Argument.TYPES.CATEGORY_CHANNEL:
                return this.fetchCategoryChannel(raw)

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
            const locale = await LocaleProvider.guild(this.guild)
            throw locale.translate("error_text_channel_does_not_exist", id)
        }

        return channel as Discord.TextChannel
    }
    
    /**
     * Fetch a voice channel by id
     */
    async fetchVoiceChannel(id: string) {
        const channel = this.guild.channels.cache.get(id)

        if (!channel || channel.type !== "voice") {
            const locale = await LocaleProvider.guild(this.guild)
            throw locale.translate("error_voice_channel_does_not_exist", id)
        }

        return channel as Discord.VoiceChannel
    }

    /**
     * Fetch a category channel by id
     */
    async fetchCategoryChannel(id: string) {
        const channel = this.guild.channels.cache.get(id)

        if (!channel || channel.type !== "category") {
            const locale = await LocaleProvider.guild(this.guild)
            throw locale.translate("error_category_does_not_exist", id)
        }

        return channel as Discord.CategoryChannel
    }
}

export default ArgumentResolver
