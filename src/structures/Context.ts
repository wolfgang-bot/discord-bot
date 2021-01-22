import * as Discord from "discord.js"
import Module from "./Module"

export type ContextProps = {
    client: Discord.Client,
    guild: Discord.Guild,
    module: Module
}

/**
 * Provides a module with contextual information.
 */
class Context implements ContextProps {
    client: Discord.Client
    guild: Discord.Guild
    module: Module

    constructor(props: ContextProps) {
        this.client = props.client
        this.guild = props.guild
        this.module = props.module
    }
}

module.exports = Context