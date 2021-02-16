import { Readable } from "../../../lib/Stream"
import Module from "../../../lib/Module"
import BroadcastChannel from "../../../services/BroadcastChannel"
import ModuleInstanceRegistry from "../../../services/ModuleInstanceRegistry"

export default class ModuleInstanceStream extends Readable<Module[]> {
    constructor(public guildId: string) {
        super()

        this.handleInstanceUpdate = this.handleInstanceUpdate.bind(this)
    }

    construct() {
        this.pushInitialValues()
        BroadcastChannel.on("module-instances/update", this.handleInstanceUpdate)
    }
    
    destroy() {
        BroadcastChannel.removeListener("module-instances/update", this.handleInstanceUpdate)
    }

    collectBuffer(buffer: Module[][]) {
        return buffer.flat()
    }

    pushInitialValues() {
        const instances = ModuleInstanceRegistry.getInstancesFromGuildId(this.guildId)
        this.push(instances)
    }

    handleInstanceUpdate(instance: Module) {
        if (instance.context.guild.id === this.guildId) {
            this.push([instance])
        }
    }
}