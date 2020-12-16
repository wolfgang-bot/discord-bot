const fs = require("fs")
const parseXML = require("xml2js").parseStringPromise

const Argument = require("./Argument.js")

/**
 * Represents a module, e.g. from src/modules/...
 */
class Module {
    /**
     * Create an instance from a "module.xml" file
     * 
     * @param {String} path
     * @returns {Module}
     */
    static async fromXMLFile(path) {
        const { module: data } = await parseXML(await fs.promises.readFile(path))

        return new Module({
            name: data.$.name,
            desc: data.$.desc,
            features: data.$.features,
            isGlobal: data.$.global === "true",
            isPrivate: data.$.private === "true",

            args: (data.argument || []).map(arg => new Argument({
                type: arg.$.type,
                name: arg.$.name,
                displayName: arg.$["display-name"],
                desc: arg.$.desc
            }))
        })
    }

    /**
     * @param {Object} data 
     * @param {String} data.name
     * @param {String} data.desc A translation key
     * @param {String} data.features A translation key
     * @param {Boolean} [data.isGlobal=false]
     * @param {Boolean} [data.isPrivate=false]
     * @param {Array<Argument>} [data.args=[]]
     * @param {Array<String>} [data.guildIds=null]
     * @param {Module} [data.mainClass=null]
     */
    constructor({
        name,
        desc,
        features,
        isGlobal = false,
        isPrivate = false,
        args = [],
        guildIds = null,
        mainClass = null
    }) {
        this.name = name
        this.desc = desc
        this.features = features
        this.isGlobal = isGlobal
        this.isPrivate = isPrivate
        this.args = args
        this.guildIds = guildIds
        this.mainClass = mainClass
    }
}

module.exports = Module