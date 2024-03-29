import Module from "./Module"
import Argument, { ArgumentProps } from "./Argument"
import Command from "./Command"
import ModuleRegistry from "../services/ModuleRegistry"
import { labelArgumentProps } from "../config"

type ModuleProps = {
    key: string,
    name: string,
    desc?: string,
    maxInstances?: number,
    position?: number,
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
        module.position = props.position
        module.features = props.features
        module.isGlobal = props.isGlobal
        module.isStatic = props.isStatic
        module.canUpdateConfig = props.canUpdateConfig
        
        if (typeof props.maxInstances === "number") {
            module.maxInstances = props.maxInstances
        }
        
        if (!module.commands) {
            module.commands = []
        }
        
        if (!module.guildIds) {
            module.guildIds = []
        }

        if (!module.args) {
            module.args = []
        }

        applyModuleDefaultValues(module)
    }
}

function applyModuleDefaultValues(module: typeof Module) {
    module.images = ModuleRegistry.findModuleImages(module)
    if (module.maxInstances > 1) {
        argument(labelArgumentProps)(module)
    }
}
