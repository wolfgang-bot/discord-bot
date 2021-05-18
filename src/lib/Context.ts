import Discord from "discord.js"
import ModuleInstance from "../models/ModuleInstance"
import Module from "./Module"

export type ContextProps = {
    client: Discord.Client,
    guild?: Discord.Guild,
    module: typeof Module,
    instance: ModuleInstance
}

/**
 * Provides a module with contextual information.
 */
class Context implements ContextProps {
    client: Discord.Client
    guild?: Discord.Guild
    module: typeof Module
    instance: ModuleInstance

    constructor(props: ContextProps) {
        this.client = props.client
        this.guild = props.guild
        this.module = props.module
        this.instance = props.instance
    }
}

export default Context
