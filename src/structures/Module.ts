import fs from "fs"
import { parseStringPromise as parseXML } from "xml2js"
import Argument from "./Argument"

type ModuleProps = {
    name: string
    desc: string
    features: string
    isGlobal: boolean
    isPrivate: boolean
    args: Argument[]
    guildIds?: string[]
    mainClass?: typeof Module
}

/**
 * Represents a module, e.g. from src/modules/...
 */
class Module implements ModuleProps {
    name: string
    desc: string
    features: string
    isGlobal: boolean
    isPrivate: boolean
    args: Argument[] = []
    guildIds: string[] = []
    mainClass: typeof Module

    /**
     * Create an instance from a "module.xml" file
     */
    static async fromXMLFile(path: string): Promise<Module> {
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
    constructor(props: ModuleProps) {
        this.name = props.name
        this.desc = props.desc
        this.features = props.features
        this.isGlobal = props.isGlobal
        this.isPrivate = props.isPrivate
        this.args = props.args
        this.guildIds = props.guildIds
        this.mainClass = props.mainClass
    }
}

export default Module