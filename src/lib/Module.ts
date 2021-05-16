import { EventEmitter } from "events"
import Configuration from "./Configuration"
import Argument from "./Argument"
import Context from "./Context"
import Command from "./Command"
import CommandRegistry from "../services/CommandRegistry"

enum STATES {
    ACTIVE,
    INACTIVE,
    STARTING,
    STOPPING
}

class Module extends EventEmitter {
    static STATES = STATES
    static config: typeof Configuration

    static key: string
    static internalName: string
    static desc: string
    static position?: number
    static images: string[]
    static features?: string[]
    static args: Argument[]
    static commands: (new () => Command)[]
    static isGlobal: boolean = false
    static isPrivate: boolean = false
    static isStatic: boolean = false
    static guildIds: string[]
    static canUpdateConfig: boolean = false
    
    context: Context
    config: Configuration
    state: STATES
    commands: Command[]

    static createCommands() {
        return this.commands.map(command => {
            const instance = new command()
            instance.module = this.key
            return instance
        })
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

    /**
     * Register commands of this module to guild's command group
     */
    registerCommands() {
        CommandRegistry.guild(this.context.guild).register(this.commands)
    }

    /**
     * Unregister commands from 'registerCommands'
     */
    unregisterCommands() {
        CommandRegistry.guild(this.context.guild).unregister(this.commands)
    }

    getConfig() {
        return this.config
    }

    /**
     * Convert an instance of this module to JSON
     */
    toJSON() {
        return {
            moduleKey: this.context.module.key,
            guildId: this.context.guild.id,
            state: this.state,
            config: this.config
        }
    }

    /**
     * Convert this module to JSON
     */
    static toJSON() {
        return {
            key: this.key,
            name: this.internalName,
            desc: this.desc,
            position: this.position,
            images: this.images,
            features: this.features,
            args: this.args,
            commands: this.createCommands(),
            isGlobal: this.isGlobal,
            isPrivate: this.isPrivate,
            isStatic: this.isStatic
        }
    }
}

export default Module
