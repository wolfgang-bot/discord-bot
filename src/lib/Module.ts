import fs from "fs"
import { parseStringPromise as parseXML } from "xml2js"
import { EventEmitter } from "events"
import Configuration from "./Configuration"
import Argument from "./Argument"
import Context from "./Context"

enum STATES {
    ACTIVE,
    INACTIVE,
    STARTING,
    STOPPING
}

type ModuleTranslations = {
    desc: string
    features: string[]
    args: Argument[]
}

class Module extends EventEmitter {
    static STATES = STATES
    static translations: ModuleTranslations

    static internalName: string
    static desc: string
    static features: string
    static args: Argument[] = []
    static isGlobal: boolean
    static isPrivate: boolean
    static guildIds: string[] = []
    
    context: Context
    config: Configuration
    state: STATES

    /**
     * Assign values from xml file to static attributes
     */
    static async loadXMLFile(path: string) {
        const { module: data } = await parseXML(await fs.promises.readFile(path))

        this.internalName = data.$.name,
        this.desc = data.$.desc,
        this.features = data.$.features,
        this.isGlobal = data.$.global === "true",
        this.isPrivate = data.$.private === "true",

        this.args = (data.argument || []).map(arg => new Argument({
            type: arg.$.type,
            name: arg.$.name,
            displayName: arg.$["display-name"],
            desc: arg.$.desc
        }))
    }

    static makeConfigFromArgs(args: any[]) {
        return new Configuration({})
    }

    static async makeConfigFromJSON(context: Context, object: object) {
        return new Configuration({})
    }

    constructor(context: Context, config?: Configuration) {
        super()

        this.context = context
        this.config = config
        this.state = Module.STATES.INACTIVE
    }

    /**
     * Start the module (will call "this.start()")
     */
    async _start() {
        this.setState(Module.STATES.STARTING)
        await this.start()
        this.setState(Module.STATES.ACTIVE)
    }

    async start() {}

    /**
     * Stop the module (will call "this.stop()")
     */
    async _stop() {
        this.setState(Module.STATES.STOPPING)
        await this.stop()
        this.setState(Module.STATES.INACTIVE)
    }

    async stop() {}

    /**
     * Set the module's state
     */
    setState(newState: STATES) {
        this.state = newState
        this.emit("update", newState)
    }

    getConfig() {
        return this.config
    }

    toJSON(): object {
        return {
            moduleName: this.context.module.internalName,
            guildId: this.context.guild.id,
            state: this.state
        }
    }

    static toJSON() {
        return {
            name: this.internalName,
            isGlobal: this.isGlobal,
            isPrivate: this.isPrivate,
            translations: this.translations
        }
    }
}

export default Module