import Discord from "discord.js"
import { Readable } from "../../../lib/Stream"
import Module from "../../../lib/Module"
import BroadcastChannel from "../../../services/BroadcastChannel"
import ModuleInstanceRegistry from "../../../services/ModuleInstanceRegistry"
import { AuthorizedSocket } from "../SocketManager"
import { SubscriptionArgs } from "../types"

export default class GuildModuleInstanceStream extends Readable<Module[]> {
    constructor(
        public client: Discord.Client,
        public socket: AuthorizedSocket,
        public args: SubscriptionArgs
    ) {
        super()

        this.handleInstanceUpdate = this.handleInstanceUpdate.bind(this)
    }

    construct() {
        this.pushInitialValues()
        BroadcastChannel.on("module-instance/update", this.handleInstanceUpdate)
    }
    
    destroy() {
        BroadcastChannel.removeListener("module-instance/update", this.handleInstanceUpdate)
    }

    collectBuffer(buffer: Module[][]) {
        return buffer.flat()
    }

    pushInitialValues() {
        const instances = ModuleInstanceRegistry.getInstancesFromGuildId(this.args.guildId)
        this.push(instances)
    }

    handleInstanceUpdate(instance: Module) {
        if (instance.context.guild.id === this.args.guildId) {
            this.push([instance])
        }
    }
}
