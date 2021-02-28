import { EventEmitter } from "events"
import Configuration from "./Configuration"
import Argument from "./Argument"
import Context from "./Context"
import Command from "./Command"

enum STATES {
    ACTIVE,
    INACTIVE,
    STARTING,
    STOPPING
}

type ModuleTranslations = {
    name: string
    desc: string
    features: string[]
    args: Argument[]
}

class Module extends EventEmitter {
    static STATES = STATES
    static translations: ModuleTranslations

    static key: string
    static internalName: string
    static desc: string
    static features: string
    static args: Argument[]
    static isGlobal: boolean = false
    static isPrivate: boolean = false
    static isStatic: boolean = false
    static guildIds: string[]
    static commands?: Command[]
    
    context: Context
    config: Configuration
    state: STATES

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
            moduleKey: this.context.module.key,
            guildId: this.context.guild.id,
            state: this.state
        }
    }

    static toJSON() {
        return {
            key: this.key,
            isGlobal: this.isGlobal,
            isPrivate: this.isPrivate,
            translations: this.translations
        }
    }
}

export default Module
