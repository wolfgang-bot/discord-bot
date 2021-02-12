import Module from "./Module"
import Argument, { ArgumentProps } from "./Argument"

type ModuleProps = {
    key: string,
    name: string,
    desc?: string,
    features?: string
}

export function argument(props: ArgumentProps) {
    return (module: typeof Module) => {
        if (!module.args) {
            module.args = []
        }
        module.args.push(new Argument(props))
    }
}

export function module(props: ModuleProps) {
    return (module: typeof Module) => {
        module.key = props.key
        module.internalName = props.name
        module.desc = props.desc
        module.features = props.features

        if (!module.args) {
            module.args = []
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