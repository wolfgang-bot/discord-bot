class Configuration {
    static fromArgs(args) {
        return new Configuration({ })
    }

    static async fromJSON(context, object) {
        return new Configuration({ })
    }

    /**
     * @param {Object} data
     */
    constructor({ }) {
    }

    toJSON() {
        return {
        }
    }
}

module.exports = Configuration