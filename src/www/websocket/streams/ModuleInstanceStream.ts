import { Readable } from "../../../lib/Stream"
import Module from "../../../lib/Module"
import BroadcastChannel from "../../../services/BroadcastChannel"

export default class ModuleInstanceStream extends Readable<Module> {
    constructor(public guildId: string) {
        super()

        this.handleInstanceUpdate = this.handleInstanceUpdate.bind(this)
    }

    construct() {
        BroadcastChannel.on("module-instances/update", this.handleInstanceUpdate)
    }
    
    destroy() {
        BroadcastChannel.removeListener("module-instances/update", this.handleInstanceUpdate)
    }

    handleInstanceUpdate(instance: Module) {
        if (instance.context.guild.id === this.guildId) {
            this.push(instance)
        }
    }
}