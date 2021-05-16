import Module from "./Module"
import Argument, { ArgumentProps } from "./Argument"
import Command from "./Command"
import ModuleRegistry from "../services/ModuleRegistry"

type ModuleProps = {
    key: string,
    name: string,
    desc?: string,
    features?: string[],
    images?: string[],
    isGlobal?: boolean,
    isStatic?: boolean,
    canUpdateConfig?: boolean
}

export function argument(props: ArgumentProps) {
    return (module: typeof Module) => {
        if (!module.args) {
            module.args = []
        }
        module.args.unshift(new Argument(props))
    }
}

export function command(command: new () => Command) {
    return (module: typeof Module) => {
        if (!module.commands) {
            module.commands = []
        }
        module.commands.unshift(command)
    }
}

export function guild(guildId: string) {
    return (module: typeof Module) => {
        if (!module.guildIds) {
            module.guildIds = []
        }
        
        module.isPrivate = true
        module.guildIds.push(guildId)
    }
}

export function module(props: ModuleProps) {
    return (module: typeof Module) => {
        module.key = props.key
        module.internalName = props.name
        module.desc = props.desc
        module.features = props.features
        module.isGlobal = props.isGlobal
        module.isStatic = props.isStatic
        module.canUpdateConfig = props.canUpdateConfig
        module.images = ModuleRegistry.findModuleImages(module)

        if (!module.args) {
            module.args = []
        }

        if (!module.commands) {
            module.commands = []
        }

        if (!module.guildIds) {
            module.guildIds = []
        }
    }
}
