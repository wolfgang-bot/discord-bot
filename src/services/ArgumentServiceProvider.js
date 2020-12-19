const Argument = require("../structures/Argument.js")
const LocaleServiceProvider = require("./LocaleServiceProvider.js")

class ArgumentServiceProvider {
    /**
     * Create a ArgumentServiceProvider instance bound to a guild
     *
     * @param {Discord.Guild} guild
     * @returns {ArgumentServiceProvider}
     */
    static guild(guild) {
        return new ArgumentServiceProvider(guild)
    }

    /**
     * @param {Discord.Guild} guild
     */
    constructor(guild) {
        this.guild = guild
    }

    /**
     * Convert a text based argument (e.g. an id) to the corresponding object
     * 
     * @param {Discord.Client} client
     * @param {Argument} argument
     * @param {String} raw
     */
    convertArgument(argument, raw) {
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
     * 
     * @param {String} id
     * @returns {Discord.TextChannel}
     */
    async fetchTextChannel(id) {
        const channel = this.guild.channels.cache.get(id)

        if (!channel || channel.type !== "text") {
            const locale = await LocaleServiceProvider.guild(this.guild)
            throw locale.translate("error_text_channel_does_not_exist", id)
        }

        return channel
    }
    
    /**
     * Fetch a voice channel by id
     * 
     * @param {String} id
     * @returns {Discord.VoiceChannel}
     */
    async fetchVoiceChannel(id) {
        const channel = this.guild.channels.cache.get(id)

        if (!channel || channel.type !== "voice") {
            const locale = await LocaleServiceProvider.guild(this.guild)
            throw locale.translate("error_voice_channel_does_not_exist", id)
        }

        return channel
    }

    /**
     * Fetch a category channel by id
     * 
     * @param {String} id
     * @returns {Discord.CategoryChannel}
     */
    async fetchCategoryChannel(id) {
        const channel = this.guild.channels.cache.get(id)

        if (!channel || channel.type !== "category") {
            const locale = await LocaleServiceProvider.guild(this.guild)
            throw locale.translate("error_category_does_not_exist", id)
        }

        return channel
    }
}

module.exports = ArgumentServiceProvider