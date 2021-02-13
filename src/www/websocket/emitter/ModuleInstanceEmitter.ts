import WebSocketEmitter from "../../../lib/WebSocketEmitter"
import Module from "../../../lib/Module"
import ModuleInstanceRegistry from "../../../services/ModuleInstanceRegistry"

export default class ModuleInstanceEmitter extends WebSocketEmitter {
    attach() {
        ModuleInstanceRegistry.eventEmitter.on("update", this.handleModuleInstanceUpdate)
    }

    remove() {
        ModuleInstanceRegistry.eventEmitter.removeListener("update", this.handleModuleInstanceUpdate)
    }

    handleModuleInstanceUpdate(instance: Module) {
        if (instance.context.guild.id in this.socket.guilds) {
            this.pushModuleInstances([instance])
        }
    }

    pushModuleInstances(instances: Module[]) {
        this.socket.emit("push:module-instances", instances)
    }
}