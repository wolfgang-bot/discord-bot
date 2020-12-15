class Argument {
    static TYPES = {
        TEXT_CHANNEL: "text_channel",
        VOICE_CHANNEL: "voice_channel",
        CATEGORY_CHANNEL: "category_channel"
    }

    /**
     * @param {Object} data
     * @param {Argument.TYPE} data.type
     * @param {String} data.name
     * @param {String} data.desc
     */
    constructor({ type, name, displayName, desc }) {
        // Verify type argument
        if (!Object.values(Argument.TYPES).some(value => value === type)) {
            throw new Error(`The type '${type}' does not exist`)
        }

        this.type = type
        this.name = name
        this.displayName = displayName
        this.desc = desc
    }
}

module.exports = Argument