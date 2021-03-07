import Discord from "discord.js"
import Module from "./Module"

export type ContextProps = {
    client: Discord.Client,
    guild?: Discord.Guild,
    module: typeof Module
}

/**
 * Provides a module with contextual information.
 */
class Context implements ContextProps {
    client: Discord.Client
    guild?: Discord.Guild
    module: typeof Module

    constructor(props: ContextProps) {
        this.client = props.client
        this.guild = props.guild
        this.module = props.module
    }
}

export default Context
