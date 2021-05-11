import Module from "./Module"
import Argument, { ArgumentProps } from "./Argument"
import Command from "./Command"
import ModuleRegistry from "../services/ModuleRegistry"

type ModuleProps = {
    key: string,
    name: string,
    desc?: string,
    features?: string[],
    images?: string[]
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

export function module(props: ModuleProps) {
    return (module: typeof Module) => {
        module.key = props.key
        module.internalName = props.name
        module.desc = props.desc
        module.features = props.features
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

export function global(module: typeof Module) {
    module.isGlobal = true
}

export function guilds(guildIds: string[]) {
    return (module: typeof Module) => {
        module.isPrivate = true
        module.guildIds = guildIds
    }
}

export function _static(module: typeof Module) {
    module.isStatic = true
}

export function canUpdateConfig(module: typeof Module) {
    module.canUpdateConfig = true
}
